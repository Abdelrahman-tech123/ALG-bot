"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useApp } from "../context/AppContext";
import NavbarControls from "../components/NavbarControls";
import CompanyCard from "../components/companies/CompanyCard";
import CompanyModal from "../components/companies/CompanyModal";
import PaginationControls from "../components/companies/PaginationControls";
import ExportModal from "../components/companies/ExportModal";
import { Search, Download, RefreshCw, Cpu, LogOut, AlertCircle, Layers, ArrowUpRight, X } from "lucide-react";

export default function DashboardPage() {
    const { t } = useApp();
    const router = useRouter();

    // require session and redirect immediately when unauthenticated
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            router.push('/login');
        }
    });

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [uniquekeyWords, setUniqueKeyWords] = useState<string[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [activePlace, setActivePlace] = useState("");
    const [activeLocation, setActiveLocation] = useState("");
    const [scraping, setScraping] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [keywordInput, setKeywordInput] = useState("");
    const [locationInput, setLocationInput] = useState("");
    const [source, setSource] = useState("Google Maps");
    const [maxResults, setMaxResults] = useState(20);
    const [selectedCompany, setSelectedCompany] = useState<any | null>(null);

    const ITEMS_PER_PAGE = 12;

    const fetchCompanies = useCallback(async (limit: number, isNewSearch = false) => {
        if (status !== "authenticated") return;

        try {
            const response = await (await import("../../lib/api")).default.get(`/api/companies`, {
                params: {
                    place: activePlace || undefined,
                    location: activeLocation || undefined,
                    limit: limit,
                },
                headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
            });

            const newCompanies = response.data.companies || [];
            const uniqueKeywordsFromApi = response.data.unique_keywords || [];

            setUniqueKeyWords(uniqueKeywordsFromApi);
            console.log("uniqueKeywordsFromApi:", uniqueKeywordsFromApi);

            setCompanies(prev => {
                if (isNewSearch) return newCompanies;
                // حماية ضد التكرار: ندمج البيانات الجديدة فقط
                const existingIds = new Set(prev.map(c => c.id));
                const uniqueNew = newCompanies.filter((c: any) => !existingIds.has(c.id));
                return [...prev, ...uniqueNew];
            });

            setTotalItems(response.data.total_items);
        } catch (err) {
            console.error("Error fetching companies:", err);
        }
    }, [status, activePlace, activeLocation, session]);

    useEffect(() => {
        const originalError = console.error;
        console.error = (...args) => {
            if (typeof args[0] === "string" && args[0].includes("fdprocessedid")) {
                return;
            }
            originalError(...args);
        };
    }, []);

    useEffect(() => {
        const threshold = 3;
        const itemsCurrentlyVisible = currentPage * ITEMS_PER_PAGE;
        const itemsFetched = companies.length;

        if (itemsCurrentlyVisible >= itemsFetched - (threshold * ITEMS_PER_PAGE)) {
            if (itemsFetched < totalItems && !scraping) {
                fetchCompanies(itemsFetched + 100, false);
            }
        }
    }, [currentPage, companies, totalItems, scraping, fetchCompanies]);

    useEffect(() => {
        // 1. إذا كان لا يزال يحمل، لا تفعل شيئاً
        if (status === "loading") return;

        if (status === "authenticated" && companies.length === 0) {
            fetchCompanies(100, true);
        }

    }, [status, companies.length, fetchCompanies]);

    const filteredCompanies = useMemo(() => {
        if (!searchQuery.trim()) return companies;

        const query = searchQuery.toLowerCase().trim();
        // الحصول على كلمة "in" المترجمة من ملف الإعدادات لديك
        const inWord = t("in").toLowerCase();

        return companies.filter(c => {
            const name = c.company_name?.toLowerCase() || "";
            const loc = c.location?.toLowerCase() || "";
            const phone = c.phone?.toLowerCase() || "";
            const keyword = c.keyword?.toLowerCase() || "";
            const source = c.source?.toLowerCase() || "";

            // التحقق من وجود كلمة in المترجمة أو الأصلية في الموقع
            const locMatches = loc.includes(query) || loc.includes(`${query} ${inWord}`) || loc.includes(`${inWord} ${query}`);

            return (
                name.includes(query) ||
                locMatches ||
                phone.includes(query) ||
                keyword.includes(query) ||
                source.includes(query)
            );
        });
    }, [companies, searchQuery, t]);

    const dynamicTotalPages = useMemo(() => Math.max(1, Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE)), [filteredCompanies]);

    const paginatedCompanies = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCompanies.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredCompanies, currentPage]);

    const handleStartScrape = async (e: React.FormEvent) => {
        e.preventDefault();
        setScraping(true);
        try {
            await (await import("../../lib/api")).default.post(`/api/scrape/run`, {
                keyword: keywordInput,
                location: locationInput,
                source,
                max_results: Number(maxResults)
            }, { headers: { Authorization: `Bearer ${(session as any)?.accessToken}` } });

            // التحديث هنا هو الأهم
            setActivePlace(keywordInput);
            setActiveLocation(locationInput);
            setCurrentPage(1);
        } catch (err) { console.error(err); } finally { setScraping(false); }
    };

    const handleExport = async (selectedKeywords: string[], fileName: string) => {
        try {
            const params = new URLSearchParams();

            selectedKeywords.forEach(kw => params.append('keywords[]', kw));

            params.append('filename', fileName);

            const response = await (await import("../../lib/api")).default.get(`/api/export_file`, {
                params: params,
                headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${fileName}.xlsx`); // استخدام الاسم المخصص
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // تنظيف الذاكرة
        } catch (err) {
            console.error("Export failed", err);
            alert("حدث خطأ أثناء تصدير الملف");
        }
    };

    // 2. هذا الـ Effect يضمن جلب داتا البحث الجديد فقط بمجرد تغير الـ activePlace
    useEffect(() => {
        if (activePlace && activeLocation) {
            fetchCompanies(100, true);
        }
    }, [activePlace, activeLocation]);

    const handleClearAllFilters = () => {
        if (scraping) return;
        setKeywordInput("");
        setLocationInput("");
        setSearchQuery("");
        setActivePlace("");
        setActiveLocation("");
        setCurrentPage(1);
        fetchCompanies(100, true);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#030407] text-slate-900 dark:text-slate-100 antialiased font-sans transition-colors duration-300">

            {/* Header */}
            <header className="bg-white/50 dark:bg-[#080b11]/60 border-b border-slate-200/60 dark:border-slate-900/60 px-4 sm:px-8 py-5 flex justify-between items-center sticky top-0 z-40 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
                        <Layers size={18} className="text-white relative z-10" />
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="font-black text-lg bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent tracking-tight">
                            {t("logo")}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{t("welcome")}</span>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-200">{session?.user?.name}</span>
                    </div>
                    <NavbarControls />
                    <button
                        onClick={() => signOut()}
                        disabled={scraping}
                        className="p-3 rounded-xl bg-white hover:bg-slate-50 dark:bg-[#0e1217] dark:hover:bg-[#131920] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-900 transition-all flex items-center gap-2 text-sm font-black shadow-sm group hover:border-rose-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <LogOut size={15} className="text-rose-500 group-hover:translate-x-0.5 transition-transform" />
                        <span className="hidden sm:inline text-slate-700 dark:text-slate-300">{t("logout")}</span>
                    </button>
                </div>
            </header>

            <main className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">

                {/* Control Panel (Scraper) */}
                <section className={`bg-white dark:bg-[#080b10] border border-slate-200/60 dark:border-slate-900/60 rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-slate-100/50 dark:shadow-none transition-all ${scraping ? "opacity-75" : ""}`}>
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 via-pink-500 to-cyan-500" />
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm uppercase tracking-widest font-black bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                            <Cpu size={16} className={scraping ? "animate-spin text-indigo-500" : "text-indigo-400"} />
                            {t("control_panel")} {scraping && <span className="text-xs text-amber-500 animate-pulse">({t("running_engine_status")})</span>}
                        </h3>
                    </div>

                    <form onSubmit={handleStartScrape} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
                        <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("keyword_label")}</label>
                            <input type="text" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} placeholder={t("keyword_placeholder")} required disabled={scraping} className="w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-900 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-extrabold" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("location_label")}</label>
                            <input type="text" value={locationInput} onChange={(e) => setLocationInput(e.target.value)} placeholder={t("location_placeholder")} required disabled={scraping} className="w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-900 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-extrabold" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("platform_label")}</label>
                            <select value={source} onChange={(e) => setSource(e.target.value)} disabled={scraping} className="w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-900 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-black">
                                <option value="Google Maps">Google Maps 📍</option>
                                <option value="Google Maps"></option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("max_results_label")}</label>
                            <input type="number" min="1" max="500" value={maxResults} onChange={(e) => setMaxResults(Math.max(1, parseInt(e.target.value) || 0))} required disabled={scraping} className="w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-200/80 dark:border-slate-900 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-black" />
                        </div>
                        <button type="submit" disabled={scraping} className="w-full relative group overflow-hidden bg-slate-950 dark:bg-white text-white dark:text-black font-black py-3.5 rounded-xl text-sm transition-all active:scale-[0.99] h-[52px] shadow-lg shadow-indigo-500/5 disabled:opacity-50 disabled:cursor-not-allowed">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-5 transition-opacity" />
                            {scraping ? (
                                <span className="flex items-center justify-center gap-2"><RefreshCw size={15} className="animate-spin" /> {t("running_engine")}</span>
                            ) : (
                                <span className="flex items-center justify-center gap-1.5 tracking-wide">{t("start_scrape")} <ArrowUpRight size={16} /></span>
                            )}
                        </button>
                    </form>
                </section>

                {/* Filter Hub */}
                <div className="space-y-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/40 dark:bg-[#080b10]/40 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-900/40 backdrop-blur-md">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{t("my_data")}</h3>
                                {(activePlace || activeLocation) && (
                                    <span className="px-3 py-1 text-xs font-black bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-xl flex items-center gap-1.5">
                                        {t("filter_label")}: {activePlace} {activeLocation ? `${t("in")} ${activeLocation}` : ""}
                                        <X size={12} className={`cursor-pointer hover:text-red-500 ${scraping ? "pointer-events-none opacity-30" : ""}`} onClick={() => { if (!scraping) { setActivePlace(""); setActiveLocation(""); setCurrentPage(1); } }} />
                                    </span>
                                )}
                                {searchQuery && (
                                    <span className="px-3 py-1 text-xs font-black bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-xl flex items-center gap-1.5">
                                        {t("search_match")}: "{searchQuery}"
                                        <X size={12} className={`cursor-pointer hover:text-red-500 ${scraping ? "pointer-events-none opacity-30" : ""}`} onClick={() => { if (!scraping) setSearchQuery(""); }} />
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 font-bold">
                                {t("results_found")}: <span className="text-indigo-500 dark:text-indigo-400 font-black">{filteredCompanies.length}</span> {t("of")} {totalItems}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute left-3.5 top-4 text-slate-400 dark:text-slate-600" size={15} />
                                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t("search_placeholder")} disabled={scraping} className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-900 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none w-full sm:w-80 transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-extrabold disabled:opacity-50 disabled:cursor-not-allowed" />
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsExportModalOpen(true)}
                                    disabled={scraping || companies.length === 0}
                                    className="flex-1 sm:flex-none bg-white hover:bg-slate-50 dark:bg-[#0d1117] dark:hover:bg-[#12161f] text-slate-800 dark:text-slate-200 text-sm font-black px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-900 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">

                                    <Download size={15} className="text-emerald-500" /> <span>{t("export_btn")}</span>
                                </button>
                                <button onClick={handleClearAllFilters} disabled={scraping} className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black px-5 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/10 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
                                    {t("all_data")}
                                </button>
                            </div>
                        </div>
                    </div>

                    {paginatedCompanies.length > 0 ? (
                        <div className="space-y-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedCompanies.map((company) => (
                                    <CompanyCard key={company.id} company={company} onSelect={setSelectedCompany} />
                                ))}
                            </div>
                            <PaginationControls currentPage={currentPage} totalPages={dynamicTotalPages} onPageChange={(page) => { if (!scraping) setCurrentPage(page); }} />
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-[#080b10] border border-slate-200 dark:border-slate-900 rounded-3xl py-24 text-center">
                            <div className="flex flex-col items-center justify-center max-w-sm mx-auto gap-3">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-900 flex items-center justify-center text-slate-400">
                                    <AlertCircle size={24} />
                                </div>
                                <p className="text-sm font-black text-slate-400 dark:text-slate-500">{t("no_data_found")}</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <CompanyModal company={selectedCompany} onClose={() => setSelectedCompany(null)} />

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                availableKeywords={uniquekeyWords}
                onExport={handleExport}
            />
        </div>
    );
}
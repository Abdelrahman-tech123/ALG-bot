"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useApp } from "../context/AppContext";
import NavbarControls from "../components/NavbarControls";
import { Search, Download, RefreshCw, Cpu, LogOut, Globe, AlertCircle } from "lucide-react";

interface Company {
    id: string;
    source: string;
    company_name: string;
    phone: string | null;
    email: string | null;
    website: string | null;
    location: string | null;
}

export default function DashboardPage() {
    const { t } = useApp();
    const { data: session, status } = useSession();
    const router = useRouter();

    const [keyword, setKeyword] = useState("");
    const [location, setLocation] = useState("");
    const [source, setSource] = useState("Google Maps");
    const [scraping, setScraping] = useState(false);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [searchFilter, setSearchFilter] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchCompanies();
        }
    }, [status]);

    const fetchCompanies = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/companies`, {
                headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
            });
            setCompanies(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStartScrape = async (e: React.FormEvent) => {
        e.preventDefault();
        setScraping(true);
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/scrape/start`,
                { keyword, location, source },
                { headers: { Authorization: `Bearer ${(session as any)?.accessToken}` } }
            );
            if (response.status === 200 || response.status === 202) {
                alert(t("scrape_success"));
            }
        } catch (err) {
            alert("Error initiating scraper.");
        } finally {
            setScraping(false);
        }
    };

    const handleExportExcel = async () => {
        window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/companies/export?token=${(session as any)?.accessToken}`, "_blank");
    };

    const filteredCompanies = companies.filter(c =>
        c.company_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (c.location && c.location.toLowerCase().includes(searchFilter.toLowerCase()))
    );

    if (status === "loading") return <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center text-slate-400 dark:text-slate-600 font-medium text-xs">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* هيدر Vercel النظيف */}
            <header className="bg-white dark:bg-black border-b border-slate-200 dark:border-slate-900 px-6 py-3.5 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-black/80">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-md tracking-tight text-slate-950 dark:text-white">{t("logo")}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col text-right">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400">{t("welcome")}</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{session?.user?.name}</span>
                    </div>
                    <NavbarControls />
                    <button onClick={() => signOut()} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800/60 transition-all flex items-center gap-1.5 text-xs font-medium">
                        <LogOut size={14} />
                        <span className="hidden md:inline">{t("logout")}</span>
                    </button>
                </div>
            </header>

            <main className="p-6 max-w-7xl mx-auto space-y-6">
                {/* لوحة التحكم */}
                <section className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 rounded-xl p-6 shadow-sm transition-colors">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
                        <Cpu size={14} />
                        {t("control_panel")}
                    </h3>
                    <form onSubmit={handleStartScrape} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">{t("keyword_label")}</label>
                            <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={t("keyword_placeholder")} required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-800 text-slate-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">{t("location_label")}</label>
                            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("location_placeholder")} required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-800 text-slate-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">{t("platform_label")}</label>
                            <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-800 text-slate-900 dark:text-white">
                                <option value="Google Maps">Google Maps</option>
                                <option value="LinkedIn">LinkedIn</option>
                            </select>
                        </div>
                        <button type="submit" disabled={scraping} className="w-full bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black font-semibold py-2 rounded-xl text-xs transition-all border border-slate-950 dark:border-white shadow-sm">
                            {scraping ? t("running_engine") : t("start_scrape")}
                        </button>
                    </form>
                </section>

                {/* الجدول */}
                <section className="bg-white dark:bg-slate-900/10 border border-slate-200 dark:border-slate-900 rounded-xl shadow-sm overflow-hidden transition-colors">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-900 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-950 dark:text-white">{t("my_data")}</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t("data_subtitle")}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute top-2.5 px-1 text-slate-400 left-2.5" size={14} />
                                <input type="text" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} placeholder={t("search_placeholder")} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none w-full sm:w-56" />
                            </div>
                            <button onClick={handleExportExcel} className="bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black text-xs font-semibold px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border border-slate-950 dark:border-white">
                                <Download size={14} />
                                <span>{t("export_btn")}</span>
                            </button>
                            <button onClick={fetchCompanies} className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 transition-all">
                                <RefreshCw size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase border-b border-slate-200 dark:border-slate-900">
                                <tr>
                                    <th className="px-6 py-3">{t("th_platform")}</th>
                                    <th className="px-6 py-3">{t("th_name")}</th>
                                    <th className="px-6 py-3">{t("th_phone")}</th>
                                    <th className="px-6 py-3">{t("th_email")}</th>
                                    <th className="px-6 py-3">{t("th_web")}</th>
                                    <th className="px-6 py-3">{t("th_address")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                                {filteredCompanies.length > 0 ? (
                                    filteredCompanies.map((company) => (
                                        <tr key={company.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/30 transition-colors">
                                            <td className="px-6 py-3.5"><span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${company.source === "Google Maps" ? "bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30" : "bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/30"}`}>{company.source}</span></td>
                                            <td className="px-6 py-3.5 font-bold text-slate-950 dark:text-white">{company.company_name}</td>
                                            <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400 font-medium">{company.phone || "—"}</td>
                                            <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400">{company.email || "—"}</td>
                                            <td className="px-6 py-3.5">
                                                {company.website ? (
                                                    <a href={company.website} target="_blank" rel="noreferrer" className="text-slate-900 dark:text-slate-300 hover:underline inline-flex items-center gap-1 font-medium">
                                                        <Globe size={12} />
                                                        <span className="max-w-[140px] truncate">{company.website}</span>
                                                    </a>
                                                ) : "—"}
                                            </td>
                                            <td className="px-6 py-3.5 text-slate-400 dark:text-slate-500 text-[11px] max-w-xs truncate">{company.location || "—"}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-20 text-slate-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <AlertCircle size={20} className="text-slate-300 dark:text-slate-800" />
                                                <p className="max-w-md text-[11px] text-slate-400 dark:text-slate-600">{t("no_data")}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}
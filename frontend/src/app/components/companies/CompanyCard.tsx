"use client";
import { Calendar, MapPin, Globe, Compass, ExternalLink } from "lucide-react";
import { useApp } from "../../context/AppContext";

interface Company {
    id: string;
    keyword: string | null;
    source: string;
    company_name: string;
    phone: string | null;
    email: string[];
    website: string | null;
    location: string | null;
    maps_link: string | null;
    open_times: any;
    first_image: string | null;
    scraped_at: string;
}

interface CompanyCardProps {
    company: Company;
    onSelect: (company: Company) => void;
}

export default function CompanyCard({ company, onSelect }: CompanyCardProps) {
    const { t } = useApp();

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
    };

    return (
        <div
            onClick={() => onSelect(company)}
            className="bg-white dark:bg-[#080b10] border border-slate-200/60 dark:border-slate-900 rounded-2xl overflow-hidden shadow-sm hover:border-slate-300 dark:hover:border-slate-800 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative h-[380px] transform hover:-translate-y-1"
        >
            <div className="w-full h-36 relative overflow-hidden bg-slate-50 dark:bg-[#0c0f14] border-b border-slate-100 dark:border-slate-900">
                {company.first_image ? (
                    <img
                        src={company.first_image}
                        alt={company.company_name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500/5 via-transparent to-pink-500/5 flex flex-col items-center justify-center p-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400 font-black text-lg border border-indigo-500/10 uppercase">
                            {company.company_name.charAt(0)}
                        </div>
                    </div>
                )}

                <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase backdrop-blur-md border ${company.source === "Google Maps"
                        ? "bg-blue-600/90 text-white border-blue-400/30"
                        : "bg-cyan-600/90 text-white border-cyan-400/30"
                        }`}>
                        {company.source}
                    </span>

                    {company.keyword && (
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-slate-900/80 text-slate-200 border border-slate-800/50 backdrop-blur-sm max-w-[150px] truncate">
                            {company.keyword.replace(/\bin\b/gi, t("in"))}
                        </span>
                    )}
                </div>

                <div className="absolute bottom-2 left-3 flex items-center gap-1 text-[10px] font-black text-slate-200 bg-slate-950/60 px-2 py-0.5 rounded backdrop-blur-sm">
                    <Calendar size={11} />
                    {formatDate(company.scraped_at)}
                </div>
            </div>

            <div className="p-5 flex flex-col justify-between flex-1 text-right">
                <div className="space-y-2">
                    <h4 className="font-black text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                        {company.company_name}
                    </h4>

                    {company.location ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 justify-end font-extrabold">
                            <span className="truncate max-w-[240px]">{company.location}</span>
                            <MapPin size={13} className="shrink-0 text-slate-400" />
                        </p>
                    ) : (
                        <p className="text-xs text-slate-400 dark:text-slate-600 italic font-bold">{t("location_undefined")}</p>
                    )}
                </div>

                <div className="py-3 my-2 border-y border-slate-100 dark:border-slate-900/60 space-y-2.5 text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between items-center">
                        <span className="font-black text-slate-900 dark:text-white tracking-wide text-sm">{company.phone || "—"}</span>
                        <span className="text-slate-400 dark:text-slate-500 font-black">{t("phone")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="truncate max-w-[160px] text-left font-bold text-slate-500 dark:text-slate-400 text-sm">
                            {company.email && company.email.length > 0 ? company.email[0] : "—"}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 font-black">{t("email")}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                    {company.website ? (
                        <a
                            href={company.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-indigo-500 dark:text-indigo-400 font-black inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-300 group/link"
                        >
                            <Globe size={13} />
                            {t("website")}
                            <ExternalLink size={11} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </a>
                    ) : (
                        <span className="text-xs text-slate-300 dark:text-slate-700 font-bold">{t("no_website")}</span>
                    )}

                    {company.maps_link && (
                        <a
                            href={company.maps_link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 font-black flex items-center gap-1 transition-colors"
                        >
                            <Compass size={13} />
                            {t("map")}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
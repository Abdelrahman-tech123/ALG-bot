"use client";
import { X, Building2, Clock, MapPin, Phone, Mail, Globe, Compass } from "lucide-react";
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

interface CompanyModalProps {
    company: Company | null;
    onClose: () => void;
}

export default function CompanyModal({ company, onClose }: CompanyModalProps) {
    const { t } = useApp();
    if (!company) return null;

    const processKeyword = (kw: string) => kw.replace(/\bin\b/gi, t("in"));

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/80 backdrop-blur-md transition-all"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-[#080b10] border border-slate-200 dark:border-slate-900 rounded-[28px] overflow-hidden shadow-2xl max-w-lg w-full flex flex-col relative text-right"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-900/40 hover:bg-slate-900/60 text-white backdrop-blur-md transition-all"
                >
                    <X size={16} />
                </button>

                <div className="w-full h-52 relative bg-slate-100 dark:bg-[#0d1117]">
                    {company.first_image ? (
                        <img
                            src={company.first_image}
                            alt={company.company_name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-500/10 flex items-center justify-center">
                            <Building2 size={48} className="text-indigo-500/20" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080b10] via-[#080b10]/30 to-transparent" />

                    <div className="absolute bottom-4 right-5 left-5">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-500 text-white tracking-widest">
                                {company.source}
                            </span>
                            {company.keyword && (
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-white/20 text-white backdrop-blur-sm">
                                    {processKeyword(company.keyword)}
                                </span>
                            )}
                        </div>
                        <h2 className="text-lg font-black text-white drop-shadow-md">{company.company_name}</h2>
                    </div>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
                    {/* {company.open_times && (
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0d1117] border border-slate-100 dark:border-slate-900 flex justify-between items-center">
                            <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                                {typeof company.open_times === 'object'
                                    ? JSON.stringify(company.open_times)
                                    : company.open_times}
                            </div>
                            <span className="text-sm font-black text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                {t("working_hours")}
                                <Clock size={16} className="text-indigo-400" />
                            </span>
                        </div>
                    )} */}

                    <div className="space-y-2">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1">
                            {t("detailed_info")}
                        </span>

                        {company.location && (
                            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/50 dark:bg-[#0d1117]/40 border border-slate-100 dark:border-slate-900">
                                <div className="flex-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-extrabold">{company.location}</div>
                                <div className="text-slate-400 mt-0.5"><MapPin size={16} /></div>
                            </div>
                        )}

                        {company.phone && (
                            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/50 dark:bg-[#0d1117]/40 border border-slate-100 dark:border-slate-900">
                                <div className="flex-1 text-sm text-slate-900 dark:text-white font-black tracking-wide">{company.phone}</div>
                                <div className="text-slate-400"><Phone size={16} /></div>
                            </div>
                        )}

                        {company.email && company.email.length > 0 ? (
                            <div className="space-y-1.5">
                                {company.email.map((mail, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/50 dark:bg-[#0d1117]/40 border border-slate-100 dark:border-slate-900">
                                        <div className="flex-1 text-sm text-slate-700 dark:text-slate-300 font-bold text-left truncate">{mail}</div>
                                        <div className="text-slate-400"><Mail size={16} /></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/50 dark:bg-[#0d1117]/40 border border-slate-100 dark:border-slate-900 opacity-60">
                                <div className="flex-1 text-sm text-slate-400 text-left italic font-bold">{t("no_email")}</div>
                                <div className="text-slate-400"><Mail size={16} /></div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-[#0c0f14] border-t border-slate-100 dark:border-slate-900 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {company.website && (
                            <a
                                href={company.website}
                                target="_blank"
                                rel="noreferrer"
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-sm flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/10"
                            >
                                <Globe size={15} />
                                {t("website")}
                            </a>
                        )}
                        {company.maps_link && (
                            <a
                                href={company.maps_link}
                                target="_blank"
                                rel="noreferrer"
                                className="px-5 py-2.5 bg-white hover:bg-slate-50 dark:bg-[#0d1117] dark:hover:bg-[#131a24] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-900 font-black rounded-xl text-sm flex items-center gap-1.5 transition-all"
                            >
                                <Compass size={15} className="text-red-500" />
                                {t("open_in_map")}
                            </a>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 text-sm font-black transition-colors"
                    >
                        {t("close")}
                    </button>
                </div>
            </div>
        </div>
    );
}
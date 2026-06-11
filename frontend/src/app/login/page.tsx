"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "../context/AppContext";
import NavbarControls from "../components/NavbarControls";
import { Mail, Lock, ArrowLeft, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const { t, lang } = useApp();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", { email, password, redirect: false });

        if (res?.error) {
            setError(t("error_auth"));
            setLoading(false);
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
            {/* الهيدر البسيط على طريقة Vercel */}
            <header className="p-4 flex justify-between items-center max-w-7xl w-full mx-auto border-b border-slate-200/50 dark:border-slate-900 bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">{t("logo")}</span>
                <NavbarControls />
            </header>

            <div className="flex-1 flex items-center justify-center px-4 py-16">
                <div className="max-w-md w-full bg-white dark:bg-slate-900/40 rounded-2xl p-8 shadow-sm dark:shadow-[0_0_50px_-12px_rgba(255,255,255,0.02)] border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-sm transition-all duration-300">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white mb-1.5 text-center">{t("login_title")}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-center text-xs mb-8">{t("login_subtitle")}</p>

                    {error && <div className="bg-rose-500/5 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl p-3 text-xs mb-5 text-center font-medium">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-2">{t("email")}</label>
                            <div className="relative">
                                <Mail className="absolute top-3 px-1 text-slate-400" size={16} style={{ [lang === 'ar' ? 'right' : 'left']: '12px' }} />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-slate-100/60 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/60 rounded-xl py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-700 text-slate-900 dark:text-white transition-all" style={{ [lang === 'ar' ? 'paddingRight' : 'paddingLeft']: '40px', [lang === 'ar' ? 'paddingLeft' : 'paddingRight']: '16px' }} placeholder="name@company.com" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-2">{t("password")}</label>
                            <div className="relative">
                                <Lock className="absolute top-3 px-1 text-slate-400" size={16} style={{ [lang === 'ar' ? 'right' : 'left']: '12px' }} />
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-slate-100/60 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/60 rounded-xl py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-700 text-slate-900 dark:text-white transition-all" style={{ [lang === 'ar' ? 'paddingRight' : 'paddingLeft']: '40px', [lang === 'ar' ? 'paddingLeft' : 'paddingRight']: '16px' }} placeholder="••••••••" />
                            </div>
                        </div>

                        {/* زرار أسود صريح غامق مثل Vercel وفاتح أنيق */}
                        <button type="submit" disabled={loading} className="w-full bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black font-semibold py-2.5 rounded-xl text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 mt-4 border border-slate-900 dark:border-white shadow-sm">
                            <span>{loading ? t("logging_in") : t("login_btn")}</span>
                            {lang === "ar" ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                        </button>
                    </form>

                    <p className="text-slate-500 dark:text-slate-400 text-center text-xs mt-8 border-t border-slate-100 dark:border-slate-800/50 pt-5">
                        {t("no_account")}{" "}
                        <Link href="/register" className="text-slate-950 dark:text-white font-semibold hover:underline">{t("create_one")}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
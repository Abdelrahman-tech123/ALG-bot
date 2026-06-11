"use client";
import { useApp } from "../context/AppContext";
import { Sun, Moon } from "lucide-react";

export default function NavbarControls() {
    const { theme, lang, toggleTheme, setLang } = useApp();

    return (
        <div className="flex items-center gap-2">
            {/* تبديل اللغة المينيمال */}
            <button
                onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all border border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider"
            >
                {lang === "ar" ? "EN" : "AR"}
            </button>

            {/* تبديل الثيم النظيف */}
            <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition-all"
            >
                {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
        </div>
    );
}
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";
type Lang = "ar" | "en";

interface AppContextType {
    theme: Theme;
    lang: Lang;
    toggleTheme: () => void;
    setLang: (lang: Lang) => void;
    t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const translations = {
    ar: {
        logo: "🌐 جامع البيانات الذكي",
        login_title: "تسجيل الدخول",
        login_subtitle: "ابدأ في استخراج البيانات وبناء قوائم عملائك",
        register_title: "إنشاء حساب جديد",
        register_subtitle: "انضم إلينا وابدأ كشط البيانات بدقائق",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        name: "الاسم بالكامل",
        login_btn: "دخول",
        logging_in: "جاري الدخول...",
        register_btn: "إنشاء الحساب",
        registering: "جاري إنشاء الحساب...",
        no_account: "ليس لديك حساب؟",
        have_account: "لديك حساب بالفعل؟",
        create_one: "أنشئ حساباً جديداً",
        sign_in_here: "سجل دخولك من هنا",
        welcome: "مرحباً بك،",
        logout: "تسجيل الخروج",
        control_panel: "🤖 لوحة التحكم في محرك الكشط",
        running_engine_status: "المحرك يعمل",
        keyword_label: "الكلمة المفتاحية (Keyword)",
        keyword_placeholder: "مثال: مطاعم، شركات شحن",
        location_label: "الموقع الجغرافي (Location)",
        location_placeholder: "مثال: القاهرة، جدة",
        platform_label: "المنصة المستهدفة",
        max_results_label: "الحد الأقصى للنتائج",
        start_scrape: "ابدأ استخراج البيانات",
        running_engine: "جاري تشغيل المحرك...",
        my_data: "📊 بياناتي المستخرجة",
        data_subtitle: "يتم حفظ هذه البيانات حصرياً لحسابك وبشكل آمن في PostgreSQL",
        search_placeholder: "ابحث فورياً في هذه الصفحة...",
        export_btn: "تصدير Excel",
        refresh: "تحديث",
        no_data_found: "لا توجد نتائج تطابق بحثك الحالي.",
        error_auth: "إيميل أو كلمة مرور خاطئة.",
        scrape_success: "🚀 تم بدء عملية الاستخراج بنجاح!",
        all_data: "كل البيانات",
        max_results: "الحد الأقصى للنتائج",
        in: "في",
        filter_label: "تصفية",
        search_match: "مطابقة البحث لـ",
        results_found: "العناصر المكتشفة بالبحث",
        of: "من أصل",
    },
    en: {
        logo: "🌐 Data Scraper Hub",
        login_title: "Sign In",
        login_subtitle: "Start extracting data and building your lead lists",
        register_title: "Create New Account",
        register_subtitle: "Join us and start scraping data in minutes",
        email: "Email Address",
        password: "Password",
        name: "Full Name",
        login_btn: "Sign In",
        logging_in: "Signing in...",
        register_btn: "Create Account",
        registering: "Creating account...",
        no_account: "Don't have an account?",
        have_account: "Already have an account?",
        create_one: "Create an account",
        sign_in_here: "Sign in here",
        welcome: "Welcome,",
        logout: "Sign Out",
        control_panel: "🤖 Scraper Engine Control Panel",
        running_engine_status: "Engine running",
        keyword_label: "Keyword",
        keyword_placeholder: "e.g., restaurants, tech companies",
        location_label: "Location",
        location_placeholder: "e.g., Cairo, Dubai",
        platform_label: "Target Platform",
        max_results_label: "Max results",
        start_scrape: "Start Scraping",
        running_engine: "Running engine...",
        my_data: "📊 Your Extracted Data",
        data_subtitle: "This data is securely stored for your account in PostgreSQL",
        search_placeholder: "Search results...",
        export_btn: "Export Excel",
        refresh: "Refresh",
        no_data_found: "No results match your current search.",
        error_auth: "Invalid email or password.",
        scrape_success: "🚀 Scraping process started successfully!",
        all_data: "all data",
        max_results: "Max results",
        in: "in",
        filter_label: "Filter",
        search_match: "Search matches",
        results_found: "Result found",
        of: "of",
    }
};

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");
    const [lang, setLang] = useState<Lang>("ar");

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === "dark") root.classList.add("dark");
        else root.classList.remove("dark");
    }, [theme]);

    const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

    const t = (key: string) => (translations[lang] as any)[key] || key;

    return (
        <AppContext.Provider value={{ theme, lang, toggleTheme, setLang, t }}>
            <div dir={lang === "ar" ? "rtl" : "ltr"}>{children}</div>
        </AppContext.Provider>
    );
}

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp must be used within an AppProvider");
    return context;
};
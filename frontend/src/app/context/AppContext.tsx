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

// قاموس الترجمة الداخلي لجميع الصفحات
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
        keyword_label: "الكلمة المفتاحية (Keyword)",
        keyword_placeholder: "مثال: مطاعم، شركات شحن",
        location_label: "الموقع الجغرافي (Location)",
        location_placeholder: "مثال: القاهرة، جدة",
        platform_label: "المنصة المستهدفة",
        start_scrape: "ابدأ استخراج البيانات 🚀",
        running_engine: "جاري تشغيل المحرك...",
        my_data: "📊 البيانات المستخرجة الخاصة بك",
        data_subtitle: "يتم حفظ هذه البيانات حصرياً لحسابك وبشكل آمن في PostgreSQL",
        search_placeholder: "ابحث في النتائج...",
        export_btn: "تصدير لملف Excel 💾",
        refresh: "تحديث",
        th_platform: "المنصة",
        th_name: "اسم الشركة",
        th_phone: "الهاتف",
        th_email: "البريد الإلكتروني",
        th_web: "الموقع الإلكتروني",
        th_address: "العنوان",
        no_data: "لا توجد بيانات متاحة حالياً. ابدأ بتشغيل السكرابر لاستخراج أول قائمة عملاء.",
        error_auth: "إيميل أو كلمة مرور خاطئة. تأكد من البيانات.",
        scrape_success: "🚀 بدأ الكشط في الخلفية! سيتم تحديث الجدول تلقائياً فور توفر البيانات."
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
        keyword_label: "Keyword",
        keyword_placeholder: "e.g., restaurants, tech companies",
        location_label: "Location",
        location_placeholder: "e.g., Cairo, Dubai",
        platform_label: "Target Platform",
        start_scrape: "Start Scraping 🚀",
        running_engine: "Running engine...",
        my_data: "📊 Your Extracted Data",
        data_subtitle: "This data is securely stored for your account in PostgreSQL",
        search_placeholder: "Search results...",
        export_btn: "Export to Excel 💾",
        refresh: "Refresh",
        th_platform: "Platform",
        th_name: "Company Name",
        th_phone: "Phone",
        th_email: "Email",
        th_web: "Website",
        th_address: "Address",
        no_data: "No data available yet. Start the scraper to extract your first lead list.",
        error_auth: "Invalid email or password. Please check your credentials.",
        scrape_success: "🚀 Scraping started in background! The table will refresh automatically."
    }
};

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");
    const [lang, setLang] = useState<Lang>("ar");

    // تبديل الكلاسات على عنصر الـ HTML لتفعيل الـ Dark Mode الخاص بـ Tailwind
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [theme]);

    const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

    const t = (key: string) => {
        return (translations[lang] as any)[key] || key;
    };

    return (
        <AppContext.Provider value={{ theme, lang, toggleTheme, setLang, t }}>
            <div dir={lang === "ar" ? "rtl" : "ltr"} className={lang === "ar" ? "font-sans" : "font-sans"}>
                {children}
            </div>
        </AppContext.Provider>
    );
}

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp must be used within an AppProvider");
    return context;
};
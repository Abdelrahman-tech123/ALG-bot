import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import { AppProvider } from "./context/AppContext";
import { Cairo, Plus_Jakarta_Sans } from "next/font/google";

// إعداد خط Cairo ليكون حاداً وعريضاً ومميزاً
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800", "900"], // أوزان عريضة وممتازة
  variable: "--font-cairo",
  display: "swap", // يضمن ظهور النص فوراً بدون تأخير
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Data Scraper Hub",
  description: "Premium SaaS Data Scraper",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${jakarta.variable}`}>
      {/* إضافة font-medium أو font-bold هنا تجعل النصوص العربية تظهر بسمك فخم ومريح للعين افتراضياً */}
      <body className="font-sans font-medium antialiased text-slate-900 dark:text-slate-100">
        <AuthProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
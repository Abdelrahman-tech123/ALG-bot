import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import { AppProvider } from "./context/AppContext";

export const metadata: Metadata = {
  title: "Data Scraper Hub",
  description: "Premium SaaS Data Scraper",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { labs } from "@/data/labs";
import { themeInitScript } from "@/lib/theme";
import "@/styles/globals.css";
import "@/styles/navigation.css";
import "@/styles/report.css";

const manrope = localFont({
  src: "./fonts/Manrope-Variable.ttf",
  variable: "--font-manrope",
  weight: "200 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "XlsParse — учебные задачи по порядку",
    template: "%s | XlsParse",
  },
  description: "Планировщик студента: учебные задачи, десять этапов разработки и единый отчёт по Web-технологиям.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const navigationLabs = labs.map(({ id, title, status, topic }) => ({ id, title, status, topic }));
  return (
    <html lang="ru" className={manrope.variable} data-theme="dark" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
      <body>
        <a className="skip-link" href="#content">К содержанию</a>
        <div className="app-shell">
          <aside className="sidebar">
            <Sidebar items={navigationLabs} />
          </aside>
          <div className="workspace">
            <Header items={navigationLabs} />
            <main id="content" className="content" tabIndex={-1}>{children}</main>
            <footer className="site-footer no-print">
              <span>XlsParse <span className="footer-dot">·</span> Учиться. Создавать. Расти.</span>
              <span>Учебный проект по Web-технологиям</span>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { labs } from "@/data/labs";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Планировщик студента — Web-технологии",
    template: "%s | Web-технологии",
  },
  description: "Планировщик студента: учебные задачи, десять этапов разработки и единый отчёт по Web-технологиям.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru">
      <body>
        <a className="skip-link" href="#content">К содержанию</a>
        <Header />
        <div className="app-shell">
          <aside className="sidebar">
            <Sidebar items={labs.map(({ id, title }) => ({ id, title }))} />
          </aside>
          <main id="content" className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}

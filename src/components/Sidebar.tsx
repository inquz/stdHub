"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark, Icon, type IconName } from "./Icon";

export type SidebarItem = {
  id: number;
  title: string;
  topic?: string;
  status?: "planned" | "in-progress" | "done";
};

export const mainNavigation: { href: string; title: string; icon: IconName }[] = [
  { href: "/", title: "Обзор", icon: "grid" },
  { href: "/project", title: "Планировщик", icon: "calendar" },
  { href: "/labs", title: "Лабораторные", icon: "code" },
  { href: "/report", title: "Отчёт", icon: "file" },
];

const labTitles: Record<number, string> = {
  1: "Структура HTML",
  2: "Формы и таблицы",
  3: "Знакомство с CSS",
  4: "Селекторы и блоки",
  5: "Меню навигации",
  6: "Вёрстка и компоновка",
  7: "Основы JavaScript",
  8: "Объекты и массивы",
  9: "Работа с DOM",
  10: "События и интерактив",
};

export function shortLabTitle(lab: SidebarItem) {
  return labTitles[lab.id] ?? lab.title;
}

export function isNavigationActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ items }: { items: SidebarItem[] }) {
  const pathname = usePathname();
  const completed = items.filter((lab) => lab.status === "done").length;
  const progress = items.length ? Math.round(completed / items.length * 100) : 0;

  return (
    <div className="sidebar-inner">
      <Link className="brand" href="/" aria-label="StudHub — на главную">
        <BrandMark />
        <span>Stud<span className="brand-light">Hub</span><small>пространство для учёбы</small></span>
      </Link>

      <div className="sidebar-scroll">
        <nav className="primary-navigation" aria-label="Основная навигация">
          {mainNavigation.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isNavigationActive(pathname, item.href) ? "page" : undefined}>
              <Icon name={item.icon} size={19} />
              <span>{item.title}</span>
              {item.href === "/labs" && <span className="nav-count">{items.length}</span>}
            </Link>
          ))}
        </nav>

        <nav className="course-navigation" aria-label="Лабораторные работы">
          <div className="sidebar-label"><span>Веб-технологии</span><span>01—{String(items.length).padStart(2, "0")}</span></div>
          <ol className="sidebar-list">
            {items.map((lab) => (
              <li key={lab.id}>
                <Link href={`/labs/${lab.id}`} aria-current={pathname === `/labs/${lab.id}` ? "page" : undefined} title={lab.title}>
                  <span className={`sidebar-lab-number${lab.status === "done" ? " is-done" : ""}`}>
                    {lab.status === "done" ? <Icon name="check" size={12} /> : String(lab.id).padStart(2, "0")}
                  </span>
                  <span className="sidebar-lab-title">{shortLabTitle(lab)}</span>
                  {lab.status === "done" && <span className="sr-only"> — готова</span>}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="sidebar-progress">
          <div><span>Шаг за шагом</span><strong>{progress}%</strong></div>
          <progress value={completed} max={items.length || 1} aria-label={`Готово ${completed} из ${items.length} лабораторных`} />
          <p>{completed} из {items.length} лабораторных готовы</p>
        </div>
      </div>

      <div className="sidebar-profile">
        <span className="profile-icon"><Icon name="book" size={19} /></span>
        <div><strong>Учебный проект</strong><span>Веб-технологии · 2026</span></div>
        <span className="profile-dot" aria-hidden="true" />
      </div>
    </div>
  );
}

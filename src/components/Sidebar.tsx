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
  { href: "/project", title: "Пароскоп", icon: "calendar" },
  { href: "/labs", title: "Лабораторные", icon: "code" },
  { href: "/report", title: "Отчёт", icon: "file" },
];

export function isNavigationActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function CourseProgress({ items }: { items: SidebarItem[] }) {
  const completed = items.filter((lab) => lab.status === "done").length;
  const progress = items.length ? Math.round(completed / items.length * 100) : 0;

  return (
    <div className="sidebar-progress">
      <p className="sidebar-progress-course">Веб-технологии</p>
      <div><span>Готовность работ</span><strong>{progress}%</strong></div>
      <progress value={completed} max={items.length || 1} aria-label={`Готово ${completed} из ${items.length} лабораторных`} />
      <p><Icon name="check" size={13} /> {completed} из {items.length} лабораторных готовы</p>
    </div>
  );
}

export function Sidebar({ items }: { items: SidebarItem[] }) {
  const pathname = usePathname();

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

        <CourseProgress items={items} />
      </div>

      <div className="sidebar-profile">
        <span className="profile-icon"><Icon name="book" size={19} /></span>
        <div><strong>Учебный проект</strong><span>Веб-технологии · 2026</span></div>
        <span className="profile-dot" aria-hidden="true" />
      </div>
    </div>
  );
}

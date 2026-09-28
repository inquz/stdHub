"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { BrandMark, Icon } from "./Icon";
import { CourseProgress, isNavigationActive, mainNavigation, type SidebarItem } from "./Sidebar";
import { ProfileAvatar } from "./ProfileAvatar";
import { ThemeToggle } from "./ThemeToggle";

export function Header({ items = [] }: { items?: SidebarItem[] }) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const activePage = mainNavigation.find((item) => isNavigationActive(pathname, item.href));
  const activeLab = items.find((lab) => pathname === `/labs/${lab.id}`);

  function closeMenu() {
    if (menuRef.current) menuRef.current.open = false;
  }

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuRef.current?.open) {
        closeMenu();
        menuRef.current?.querySelector("summary")?.focus();
      }
    };
    const onOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) closeMenu();
    };
    document.addEventListener("keydown", onEscape);
    document.addEventListener("pointerdown", onOutsidePointer);
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.removeEventListener("pointerdown", onOutsidePointer);
    };
  }, []);

  return (
    <header className="site-header">
      <div className="header-leading">
        <details className="mobile-navigation" ref={menuRef} onBlur={(event) => {
          if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) closeMenu();
        }}>
          <summary className="mobile-menu-trigger" aria-label="Меню навигации">
            <span className="mobile-open-icon"><Icon name="menu" /></span>
            <span className="mobile-close-icon"><Icon name="close" /></span>
          </summary>
          <div className="mobile-menu-panel">
            <Link className="brand mobile-brand" href="/" onNavigate={closeMenu}><BrandMark /><span>XlsParse</span></Link>
            <nav className="primary-navigation" aria-label="Основная навигация на мобильном экране">
              {mainNavigation.map((item) => (
                <Link key={item.href} href={item.href} aria-current={isNavigationActive(pathname, item.href) ? "page" : undefined} onNavigate={closeMenu}>
                  <Icon name={item.icon} size={19} /><span>{item.title}</span>
                </Link>
              ))}
            </nav>
            <CourseProgress items={items} />
          </div>
        </details>

        <nav className="header-breadcrumb" aria-label="Навигационная цепочка">
          <Link className="breadcrumb-home" href="/">Моё пространство</Link>
          <span className="breadcrumb-separator" aria-hidden="true">/</span>
          {activeLab ? <><Link href="/labs">Лабораторные</Link><span className="breadcrumb-separator" aria-hidden="true">/</span><span aria-current="page">№ {String(activeLab.id).padStart(2, "0")}</span></> : <span aria-current="page">{activePage?.title ?? "Страница"}</span>}
        </nav>
      </div>

      <div className="header-actions">
        <span className="header-course"><span aria-hidden="true" />Учимся. Создаём. Растём.</span>
        <ThemeToggle />
        <ProfileAvatar />
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarItem = { id: number; title: string };

export function Sidebar({ items }: { items: SidebarItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Лабораторные работы">
      <p className="eyebrow">Содержание</p>
      <ol className="sidebar-list">
        {items.map((lab) => {
          const href = `/labs/${lab.id}`;
          return (
            <li key={lab.id}>
              <Link href={href} aria-current={pathname === href ? "page" : undefined}>
                <span className="lab-number">{String(lab.id).padStart(2, "0")}</span>
                <span>{lab.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

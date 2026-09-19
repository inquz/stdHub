import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">StudHub</Link>
      <nav aria-label="Основная навигация">
        <Link href="/project">Планировщик</Link>
        <Link href="/labs">Лабораторные</Link>
        <Link href="/report">Отчёт</Link>
      </nav>
    </header>
  );
}

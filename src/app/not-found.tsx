import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <p className="eyebrow">404</p>
      <h1>Страница не найдена</h1>
      <p className="lead">Проверьте адрес или выберите работу из списка.</p>
      <Link className="button" href="/labs">К лабораторным</Link>
    </>
  );
}

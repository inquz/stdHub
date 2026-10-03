import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found-page page-enter">
      <span className="not-found-number" aria-hidden="true">404</span>
      <p className="eyebrow">Небольшое отклонение от плана</p>
      <h1>Кажется, мы свернули не туда</h1>
      <p className="lead">Такой страницы нет. Но все лабораторные на месте — можно продолжить оттуда</p>
      <Link className="button" href="/labs">К лабораторным</Link>
    </div>
  );
}

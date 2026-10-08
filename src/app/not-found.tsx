import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found-page page-enter">
      <span className="not-found-number" aria-hidden="true">404</span>
      <p className="eyebrow">Эту страницу в расписание не внесли</p>
      <h1>Тут окно. Но не браузерное</h1>
      <p className="lead">Страницы по этому адресу нет. Лабы на месте — они так просто от нас не уйдут</p>
      <Link className="button" href="/labs">К лабораторным</Link>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Lab } from "@/data/labs";
import { LabCard } from "@/components/LabCard";
import { labPresentation } from "@/data/lab-presentation";

type LabSummary = Pick<Lab, "id" | "title" | "topic" | "status">;
const categories = ["Все работы", "HTML", "CSS и вёрстка", "JavaScript"] as const;
type Category = typeof categories[number];

function matchesCategory(lab: LabSummary, category: Category) {
  return category === "Все работы" || (category === "CSS и вёрстка" ? lab.topic === "CSS" || lab.topic === "Вёрстка" : lab.topic === category);
}

export function LabsExplorer({ items }: { items: LabSummary[] }) {
  const [category, setCategory] = useState<Category>("Все работы");
  const [query, setQuery] = useState("");
  const search = query.trim().toLocaleLowerCase("ru");
  const filtered = items.filter((lab) => matchesCategory(lab, category) && `${lab.id} ${lab.title} ${labPresentation[lab.id]?.title} ${labPresentation[lab.id]?.description}`.toLocaleLowerCase("ru").includes(search));

  return (
    <section className="labs-explorer" aria-label="Каталог лабораторных">
      <div className="catalog-toolbar">
        <div className="filter-tabs" role="group" aria-label="Технология">{categories.map((item) => <button type="button" key={item} aria-pressed={item === category} onClick={() => setCategory(item)}>{item}<span>{items.filter((lab) => matchesCategory(lab, item)).length}</span></button>)}</div>
        <label className="search-field"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></svg><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти работу…" aria-label="Поиск лабораторной" /></label>
      </div>
      <p className="catalog-count" aria-live="polite">{search || category !== "Все работы" ? `Найдено: ${filtered.length} из ${items.length}` : `Всего работ: ${items.length}`}</p>
      {filtered.length ? <ol className="lab-grid">{filtered.map((lab) => <LabCard key={lab.id} lab={lab} />)}</ol> : <div className="empty-state"><span className="empty-symbol" aria-hidden="true">⌕</span><h2>Пока ничего не нашлось</h2><p>Попробуй другую тему или короткий поисковый запрос.</p><button className="button secondary" type="button" onClick={() => { setCategory("Все работы"); setQuery(""); }}>Сбросить фильтры</button></div>}
    </section>
  );
}

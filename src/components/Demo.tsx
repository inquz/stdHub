import type { Lab } from "@/data/labs/types";
import { Icon } from "@/components/Icon";

export function Demo({ demo, result }: { demo?: Lab["demo"]; result?: string }) {
  return (
    <>
      {demo ? (
        <div className="demo-screen">
          <div className="demo-toolbar">
            <div className="demo-window-dots" aria-hidden="true"><i /><i /><i /></div>
            <span className="demo-title">{demo.title}</span>
            <a href={demo.src} target="_blank" rel="noopener noreferrer">Открыть отдельно <Icon name="external" size={14} /></a>
          </div>
          <iframe className="demo-frame" src={demo.src} title={demo.title} loading="lazy" />
          <div className="demo-footnote"><Icon name="code" size={14} /><span>Самостоятельная HTML-страница · исходный вид лабораторной</span></div>
        </div>
      ) : <p className="placeholder no-print">Демонстрация ещё не добавлена.</p>}
      <p className="print-only">
        {demo ? <>Веб-демонстрация: <a href={demo.src}>{demo.src}</a>.</> : "Демонстрация ещё не добавлена."}
      </p>
      {result && <div className="demo-result"><span className="eyebrow">Результат работы</span><p className="text-content">{result}</p></div>}
    </>
  );
}

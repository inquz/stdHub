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
          <div className="demo-footnote"><Icon name="code" size={14} /><span>Живая HTML-страница этого этапа. Можно тыкать: это демо, а не скрин для отчёта</span></div>
        </div>
      ) : <p className="placeholder no-print">Демо ещё собирается. Пока можно заглянуть в описание</p>}
      <p className="print-only">
        {demo ? <>Потыкать демо в браузере: <a href={demo.src}>{demo.src}</a>.</> : "Демо ещё собирается"}
      </p>
      {result && <div className="demo-result"><span className="eyebrow">Результат работы</span><p className="text-content">{result}</p></div>}
    </>
  );
}

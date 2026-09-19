import type { Lab } from "@/data/labs/types";

export function Demo({ demo, result }: { demo?: Lab["demo"]; result?: string }) {
  return (
    <>
      {demo ? (
        <div className="demo-screen">
          <div className="demo-toolbar">
            <span>{demo.title}</span>
            <a href={demo.src} target="_blank" rel="noopener noreferrer">Открыть отдельно ↗</a>
          </div>
          <iframe className="demo-frame" src={demo.src} title={demo.title} loading="lazy" />
        </div>
      ) : <p className="placeholder no-print">Демонстрация ещё не добавлена.</p>}
      <p className="print-only">
        {demo ? <>Веб-демонстрация: <a href={demo.src}>{demo.src}</a>.</> : "Демонстрация ещё не добавлена."}
      </p>
      {result && <p className="text-content">{result}</p>}
    </>
  );
}

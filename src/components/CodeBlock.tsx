export function CodeBlock({ language, source, title, href }: {
  language: string; source: string; title?: string; href?: string;
}) {
  return (
    <figure className="code-block">
      <figcaption>
        {title ? `${title} · ${language}` : language}
        {href && <a className="source-link no-print" href={href} target="_blank" rel="noopener noreferrer">Полная страница ↗</a>}
      </figcaption>
      <pre tabIndex={0} aria-label={`Код: ${language}`}><code>{source}</code></pre>
    </figure>
  );
}

import { CopyCodeButton } from "@/components/CopyCodeButton";
import { Icon } from "@/components/Icon";

export function CodeBlock({ language, source, title, href }: {
  language: string; source: string; title?: string; href?: string;
}) {
  return (
    <figure className="code-block">
      <figcaption>
        <div className="code-file-label"><span className="code-language">{language}</span><span>{title ?? "Исходный код"}</span></div>
        <div className="code-actions no-print">
          {href && <a className="source-link" href={href} target="_blank" rel="noopener noreferrer">Весь файл <Icon name="external" size={13} /></a>}
          <CopyCodeButton source={source} />
        </div>
      </figcaption>
      <pre tabIndex={0} aria-label={`Код: ${title ?? language}`}><code>{source}</code></pre>
    </figure>
  );
}

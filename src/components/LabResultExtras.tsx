import Image from "next/image";
import type { Lab } from "@/data/labs/types";
import { Icon } from "./Icon";
import styles from "./LabResultExtras.module.css";

export function LabResultExtras({ lab }: { lab: Lab }) {
  return (
    <>
      {lab.demoVariants?.length ? <nav className={styles.variants} aria-label="Варианты демонстрации">
        {lab.demoVariants.map((variant) => <a key={variant.src} href={variant.src} target="_blank" rel="noopener noreferrer">
          {variant.title}<Icon name="external" size={15} />
        </a>)}
      </nav> : null}
      {lab.comparison && <div className={styles.comparison} role="region" aria-label="Сравнение вариантов вёрстки" tabIndex={0}>
        <table>
          <caption>Сравнение вариантов</caption>
          <thead><tr>{lab.comparison.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
          <tbody>{lab.comparison.rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => index === 0
            ? <th scope="row" key={index}>{cell}</th>
            : <td key={index}>{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>}
      {lab.figures?.length ? <div className={styles.figures}>
        {lab.figures.map((figure) => <figure key={figure.src}>
          <a href={figure.src} target="_blank" rel="noopener noreferrer" aria-label={`Открыть снимок: ${figure.caption}`}>
            <Image src={figure.src} alt={figure.caption} width={figure.width} height={figure.height} unoptimized />
          </a>
          <figcaption>{figure.caption}</figcaption>
        </figure>)}
      </div> : null}
    </>
  );
}

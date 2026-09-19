import Link from "next/link";
import type { Lab } from "@/data/labs";
import { labStatusLabels } from "@/data/labs/types";

export function LabCard({ lab }: { lab: Lab }) {
  return (
    <li>
      <Link className="lab-card" href={`/labs/${lab.id}`}>
        <span className="eyebrow">Лабораторная {String(lab.id).padStart(2, "0")} · {lab.topic}</span>
        <h2>{lab.title}</h2>
        <span className={`status-badge status-${lab.status}`}>{labStatusLabels[lab.status]}</span>
        <span className="card-link">Открыть работу →</span>
      </Link>
    </li>
  );
}

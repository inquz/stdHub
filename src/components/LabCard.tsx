import Link from "next/link";
import type { Lab } from "@/data/labs";
import { labStatusLabels } from "@/data/labs/types";
import { labPresentation } from "@/data/lab-presentation";
import { Icon } from "@/components/Icon";

export function LabCard({ lab }: { lab: Lab }) {
  const presentation = labPresentation[lab.id];
  return (
    <li>
      <Link className={`lab-card ${lab.status === "done" ? "lab-card-done" : ""}`} href={`/labs/${lab.id}`}>
        <div className="lab-card-top"><span className={`topic-tag topic-${lab.topic === "HTML" ? "html" : lab.topic === "JavaScript" ? "js" : "css"}`}>{lab.topic}</span><span className="card-number">{String(lab.id).padStart(2, "0")}</span></div>
        <h2>{presentation?.title ?? lab.title}</h2>
        <p>{presentation?.description ?? lab.title}</p>
        <div className="lab-card-footer"><span className={`status-badge status-${lab.status}`}>{lab.status === "done" ? <Icon name="check" size={13} /> : <span className="badge-dot" />}{labStatusLabels[lab.status]}</span><span className="card-arrow"><Icon name="arrow-up-right" size={19} /></span></div>
      </Link>
    </li>
  );
}

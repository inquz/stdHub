import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LabReport } from "@/components/LabReport";
import { getLab, labs } from "@/data/labs";
import { labPresentation } from "@/data/lab-presentation";

export const dynamicParams = false;

export function generateStaticParams() {
  return labs.map((lab) => ({ id: String(lab.id) }));
}

export async function generateMetadata({ params }: PageProps<"/labs/[id]">): Promise<Metadata> {
  const lab = getLab((await params).id);
  if (!lab) notFound();
  return { title: `Лабораторная № ${lab.id}. ${lab.title}`, description: labPresentation[lab.id]?.description };
}

export default async function LabPage({ params }: PageProps<"/labs/[id]">) {
  const lab = getLab((await params).id);
  if (!lab) notFound();
  const index = labs.indexOf(lab);
  const previous = labs[index - 1];
  const next = labs[index + 1];

  return (
    <>
      <Link className="back-link" href="/labs">← Все лабораторные</Link>
      <LabReport lab={lab} />
      <nav className="lab-pagination no-print" aria-label="Переход между работами">
        {previous && <Link href={`/labs/${previous.id}`}>← Работа № {previous.id}</Link>}
        {next && <Link href={`/labs/${next.id}`}>Работа № {next.id} →</Link>}
      </nav>
    </>
  );
}

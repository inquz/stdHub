import { HomeHero } from "@/components/HomeHero";
import { HomeOverview } from "@/components/HomeOverview";

export default function Home() {
  return (
    <div className="overview page-enter">
      <div className="page-heading">
        <div><p className="eyebrow">Шедевры Web-дева</p><h1>Лабохранилище<span className="accent-text"></span></h1></div>
        <span className="semester-label"><span className="status-dot" />Web-технологии</span>
      </div>
      <HomeHero />
      <HomeOverview />
    </div>
  );
}

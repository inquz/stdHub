import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "arrow-up-right" | "arrow-right" | "arrow-left" | "arrow-down" | "check" | "book"
  | "grid" | "calendar" | "file" | "code" | "layers" | "sun" | "moon"
  | "menu" | "close" | "chevron-down" | "external" | "clock" | "sparkles"
  | "plus" | "copy" | "download";

const paths: Record<IconName, ReactNode> = {
  "arrow-up-right": <path d="M6 18 18 6M6 6h12v12" />,
  "arrow-right": <path d="M4 12h16m-6-6 6 6-6 6" />,
  "arrow-left": <path d="M20 12H4m6-6-6 6 6 6" />,
  "arrow-down": <path d="M12 4v16m-6-6 6 6 6-6" />,
  check: <path d="m5 12 4 4L19 6" />,
  book: <><path d="M12 5.5C9 3.5 5.5 3.5 3 4v15c3-.5 6.5-.5 9 1 2.5-1.5 6-1.5 9-1V4c-2.5-.5-6-.5-9 1.5Z" /><path d="M12 5.5V20" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 11h18m-13 5h2m4 0h2" /></>,
  file: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" /><path d="M14 3v6h6M8 13h8m-8 4h5" /></>,
  code: <path d="m7 7-5 5 5 5m10-10 5 5-5 5M14 4l-4 16" />,
  layers: <path d="m12 3 10 5-10 5L2 8Zm-9 10 9 4 9-4M3 18l9 4 9-4" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41m0-14.14-1.41 1.41M6.34 17.66l-1.41 1.41" /></>,
  moon: <path d="M20.9 13a9 9 0 0 1-9.9-9.9A9 9 0 1 0 20.9 13Z" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  external: <><path d="M14 3h7v7m0-7L10 14" /><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  sparkles: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4M3 18v4m-2-2h4" />,
  plus: <path d="M12 5v14M5 12h14" />,
  copy: <><rect x="8" y="8" width="13" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
  download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />,
};

export function Icon({ name, size = 20, ...props }: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" data-icon={name} {...props}>
      {paths[name]}
    </svg>
  );
}

export function BrandMark() {
  return (
    <svg className="brand-mark" width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true" focusable="false">
      <rect width="34" height="34" rx="11" fill="currentColor" />
      <path d="m9 13 8-5 8 5-8 5-8-5Zm0 7 8 5 8-5M9 16.5l8 5 8-5" stroke="var(--on-accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

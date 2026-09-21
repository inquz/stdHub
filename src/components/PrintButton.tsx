"use client";

import { Icon } from "@/components/Icon";

export function PrintButton() {
  return <button className="button no-print" type="button" onClick={() => window.print()}><Icon name="download" size={17} />Печать / PDF</button>;
}

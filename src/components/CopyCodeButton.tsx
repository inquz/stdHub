"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

export function CopyCodeButton({ source }: { source: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(source);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="code-copy">
      <button type="button" className="copy-code-button" onClick={copy}>
        <Icon name={status === "copied" ? "check" : "copy"} size={14} />
        {status === "copied" ? "Скопировано" : "Копировать"}
      </button>
      <span className={status === "error" ? "code-copy-error" : "code-copy-status"} role="status">
        {status === "error" ? "Браузер не дал скопировать. Выдели код и нажми Ctrl+C — старый добрый способ" : status === "copied" ? "Код в буфере. Ctrl+V ждёт своего часа" : ""}
      </span>
    </div>
  );
}

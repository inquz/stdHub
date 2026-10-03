"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./Icon";
import { author } from "@/data/author";
import styles from "./ProfileAvatar.module.css";

export function ProfileAvatar() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pointerInside = useRef(false);
  const dismissed = useRef(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      dismissed.current = true;
      setOpen(false);
      if (rootRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onOutsidePointer);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onOutsidePointer);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div
      className={styles.profile}
      ref={rootRef}
      onPointerEnter={(event) => {
        if (event.pointerType === "touch") return;
        pointerInside.current = true;
        dismissed.current = false;
        setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "touch") return;
        pointerInside.current = false;
        const focused = document.activeElement;
        const keyboardFocus = focused === triggerRef.current && focused?.matches(":focus-visible");
        const linkFocus = focused !== triggerRef.current && rootRef.current?.contains(focused);
        if (!keyboardFocus && !linkFocus) setOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          dismissed.current = false;
          if (!pointerInside.current) setOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        className={styles.trigger}
        type="button"
        aria-label={`GitHub автора ${author.username}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => { dismissed.current = false; setOpen((value) => !value); }}
        onFocus={(event) => {
          if (!dismissed.current && event.currentTarget.matches(":focus-visible")) setOpen(true);
        }}
      >
        <Image src={author.avatar} alt="" width={44} height={44} sizes="44px" />
        <span className={styles.badge}><Icon name="github" size={12} /></span>
      </button>
      <nav className={styles.popover} id={panelId} aria-label="Ссылки автора" hidden={!open}>
        <div className={styles.card}>
          <div className={styles.identity}>
            <Image src={author.avatar} alt="Аватар автора проекта" width={40} height={40} sizes="40px" />
            <div><strong>{author.username}</strong><span>Автор Экспарса</span></div>
            <Icon name="github" size={22} />
          </div>
          <a className={styles.link} href={author.github} target="_blank" rel="noopener noreferrer">
            <Icon name="github" size={19} />
            <span><strong>Перейти на GitHub пользователя</strong><small>@{author.username}</small></span>
            <Icon name="arrow-up-right" size={16} />
          </a>
          <a className={styles.link} href={author.repository} target="_blank" rel="noopener noreferrer">
            <Icon name="code" size={19} />
            <span><strong>Репозиторий проекта</strong><small>{author.username}/{author.repositoryName}</small></span>
            <Icon name="arrow-up-right" size={16} />
          </a>
        </div>
      </nav>
    </div>
  );
}

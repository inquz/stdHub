"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";

const PHOTO_KEY = "XlsParse-profile-photo";
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const listeners = new Set<() => void>();
let currentPhoto: string | null | undefined;

function getPhoto() {
  if (currentPhoto === undefined) {
    try {
      const saved = localStorage.getItem(PHOTO_KEY);
      currentPhoto = saved?.startsWith("data:image/") ? saved : null;
    } catch {
      currentPhoto = null;
    }
  }
  return currentPhoto;
}

function subscribeToPhoto(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== PHOTO_KEY && event.key !== null) return;
    currentPhoto = undefined;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function savePhoto(photo: string) {
  currentPhoto = photo;
  let persisted = true;
  try {
    localStorage.setItem(PHOTO_KEY, photo);
  } catch {
    persisted = false;
  }
  listeners.forEach((listener) => listener());
  return persisted;
}

async function makeThumbnail(file: File) {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 320;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable");
    const edge = Math.min(bitmap.width, bitmap.height);
    context.drawImage(bitmap, (bitmap.width - edge) / 2, (bitmap.height - edge) / 2, edge, edge, 0, 0, 320, 320);
    return canvas.toDataURL("image/webp", 0.85);
  } finally {
    bitmap.close();
  }
}

function greetingPosition(x: number, y: number) {
  const width = Math.min(250, window.innerWidth - 24);
  return {
    left: Math.max(12, Math.min(x + 16, window.innerWidth - width - 12)),
    top: Math.max(12, Math.min(y + 18, window.innerHeight - 94)),
  };
}

export function ProfileAvatar() {
  const photo = useSyncExternalStore(subscribeToPhoto, getPhoto, () => null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dismissed = useRef(false);
  const greetingId = useId();
  const [greeting, setGreeting] = useState<{ left: number; top: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; warning: boolean } | null>(null);

  useEffect(() => {
    const hide = () => setGreeting(null);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismissed.current = true;
        hide();
        setNotice(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", hide);
    window.addEventListener("scroll", hide, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", hide);
      window.removeEventListener("scroll", hide, true);
    };
  }, []);

  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setNotice({ text: "Выбери картинку в формате JPG, PNG, WebP или GIF.", warning: true });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setNotice({ text: "Эта картинка слишком большая. Подойдёт файл до 8 МБ.", warning: true });
      return;
    }
    setBusy(true);
    try {
      const saved = savePhoto(await makeThumbnail(file));
      setNotice({
        text: saved ? "Фото обновлено и сохранено в этом браузере." : "Фото обновлено. Браузер не разрешил его сохранить — после перезагрузки нужно будет выбрать снова.",
        warning: !saved,
      });
    } catch {
      setNotice({ text: "Не удалось открыть картинку. Попробуй другой файл.", warning: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="profile-avatar-wrap">
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={uploadPhoto} hidden aria-label="Выбрать фото профиля" />
      <button
        className="header-avatar"
        type="button"
        aria-label={photo ? "Изменить фото профиля" : "Добавить фото профиля"}
        aria-describedby={greeting ? greetingId : undefined}
        aria-busy={busy}
        disabled={busy}
        onClick={() => {
          dismissed.current = true;
          setGreeting(null);
          setNotice(null);
          inputRef.current?.click();
        }}
        onPointerEnter={(event) => {
          if (event.pointerType === "touch") return;
          dismissed.current = false;
          setGreeting(greetingPosition(event.clientX, event.clientY));
        }}
        onPointerMove={(event) => {
          if (event.pointerType !== "touch" && !dismissed.current) setGreeting(greetingPosition(event.clientX, event.clientY));
        }}
        onPointerLeave={(event) => {
          if (!event.currentTarget.matches(":focus-visible")) setGreeting(null);
        }}
        onFocus={(event) => {
          dismissed.current = false;
          const rect = event.currentTarget.getBoundingClientRect();
          setGreeting(greetingPosition(rect.left, rect.bottom));
        }}
        onBlur={() => setGreeting(null)}
      >
        {photo ? <Image src={photo} alt="" width={42} height={42} unoptimized /> : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" />
          </svg>
        )}
        <span className="avatar-edit-mark"><Icon name="plus" size={10} /></span>
      </button>
      <div className={notice?.warning ? "profile-notice" : "sr-only"} role="status">
        {notice?.text}
        {notice?.warning && <button type="button" aria-label="Закрыть сообщение" onClick={() => setNotice(null)}><Icon name="close" size={15} /></button>}
      </div>
      {greeting && createPortal(
        <div className="profile-greeting" id={greetingId} role="tooltip" style={greeting}>
          <strong>О, свои! Рад тебя видеть.</strong>
          <span>{photo ? "Нажми, чтобы сменить фото" : "Нажми и добавь своё фото"}</span>
        </div>,
        document.body,
      )}
    </div>
  );
}

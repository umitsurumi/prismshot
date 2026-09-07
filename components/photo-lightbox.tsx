"use client";

import { useEffect, useRef, useState } from "react";

import type { PhotoViewerItem } from "@/content/types";
import { getPhotoAlt, localize } from "@/content/types";
import type { Locale } from "@/lib/i18n";

import { ResponsivePhoto } from "./responsive-photo";
import styles from "./photo-lightbox.module.css";

interface PhotoLightboxProps {
  items: readonly PhotoViewerItem[];
  initialIndex: number;
  locale: Locale;
  onClose: () => void;
}

export function PhotoLightbox({
  items,
  initialIndex,
  locale,
  onClose,
}: PhotoLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartXRef = useRef(0);

  const step = (direction: -1 | 1) => {
    setIndex((current) => (current + direction + items.length) % items.length);
  };

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const animationFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    document.body.classList.add("menu-open");

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((current) =>
          (current - 1 + items.length) % items.length,
        );
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex((current) => (current + 1) % items.length);
      } else if (event.key === "Tab") {
        const dialog = closeButtonRef.current?.closest<HTMLElement>(
          '[role="dialog"]',
        );
        const focusable = Array.from(
          dialog?.querySelectorAll<HTMLElement>("button:not([disabled])") ?? [],
        );
        const first = focusable[0];
        const last = focusable.at(-1);

        if (event.shiftKey && document.activeElement === first && last) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last && first) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("menu-open");
      previouslyFocused?.focus();
    };
  }, [items.length, onClose]);

  const photo = items[index];

  return (
    <div
      className={styles.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label={locale === "zh" ? "照片大图查看器" : "Photo viewer"}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onTouchStart={(event) => {
        touchStartXRef.current = event.changedTouches[0]?.screenX ?? 0;
      }}
      onTouchEnd={(event) => {
        const delta =
          (event.changedTouches[0]?.screenX ?? 0) - touchStartXRef.current;
        if (Math.abs(delta) > 55) {
          step(delta > 0 ? -1 : 1);
        }
      }}
    >
      <div className={styles.stage}>
        <button
          className={`${styles.navigation} ${styles.previous}`}
          type="button"
          aria-label={locale === "zh" ? "上一张" : "Previous photograph"}
          onClick={() => step(-1)}
        >
          ←
        </button>
        <div className={styles.imageWrap}>
          <ResponsivePhoto
            key={photo.id}
            imageClassName={styles.image}
            photo={photo.asset} focalPoint={photo.focalPoint}
            alt={getPhotoAlt(photo, locale)}
            sizes="(max-width: 820px) 100vw, calc(100vw - 380px)"
          />
        </div>
        <button
          className={`${styles.navigation} ${styles.next}`}
          type="button"
          aria-label={locale === "zh" ? "下一张" : "Next photograph"}
          onClick={() => step(1)}
        >
          →
        </button>
      </div>
      <aside className={styles.info}>
        <div className={styles.counter}>
          {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </div>
        {photo.title && <h2>{localize(photo.title, locale)}</h2>}
        {photo.caption && <p>{localize(photo.caption, locale)}</p>}
        {photo.details && photo.details.length > 0 && (
          <div className={styles.meta}>
            {photo.details.map((detail) => localize(detail, locale)).join(" · ")}
          </div>
        )}
      </aside>
      <button
        ref={closeButtonRef}
        className={styles.close}
        type="button"
        aria-label={locale === "zh" ? "关闭大图" : "Close photo viewer"}
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}

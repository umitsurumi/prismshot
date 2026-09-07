"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

import {
  activities,
  calendarEvents,
  configuredEventMonths,
  eventPageCopy,
} from "@/content/events";
import {
  getPhotoAlt,
  getPhotoLabel,
  localize,
  toPhotoViewerItem,
} from "@/content/types";
import type { Locale } from "@/lib/i18n";

import { EditorialSectionHeading } from "./editorial-section-heading";
import { PhotoLightbox } from "./photo-lightbox";
import { ResponsivePhoto } from "./responsive-photo";
import styles from "./events-content.module.css";

interface EventsContentProps {
  locale: Locale;
}

const subscribeToClock = () => () => undefined;

function shanghaiDateParts(date: Date): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "numeric",
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
  };
}

function getRuntimeInitialMonthIndex(): number {
  const now = shanghaiDateParts(new Date());
  const currentIndex = configuredEventMonths.findIndex(
    (month) => month.year === now.year && month.month === now.month,
  );

  if (currentIndex >= 0) {
    return currentIndex;
  }

  const futureIndex = configuredEventMonths.findIndex(
    (month) =>
      month.year > now.year ||
      (month.year === now.year && month.month > now.month),
  );

  return futureIndex >= 0 ? futureIndex : configuredEventMonths.length - 1;
}

function getRuntimeDateKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function EventsContent({ locale }: EventsContentProps) {
  const runtimeMonthIndex = useSyncExternalStore(
    subscribeToClock,
    getRuntimeInitialMonthIndex,
    () => 0,
  );
  const todayKey = useSyncExternalStore(
    subscribeToClock,
    getRuntimeDateKey,
    () => "",
  );
  const [manualMonthIndex, setManualMonthIndex] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [openActivityId, setOpenActivityId] = useState(activities[0].id);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const copy = eventPageCopy[locale];
  const monthIndex = manualMonthIndex ?? runtimeMonthIndex;
  const currentMonth = configuredEventMonths[monthIndex];
  const monthPrefix = `${currentMonth.year}-${String(currentMonth.month).padStart(2, "0")}`;
  const monthEvents = calendarEvents.filter((event) =>
    event.date.startsWith(monthPrefix),
  );
  const activeDate =
    selectedDate?.startsWith(monthPrefix) === true
      ? selectedDate
      : monthEvents[0]?.date ?? dateKey(currentMonth.year, currentMonth.month, 1);
  const selectedEvents = calendarEvents.filter(
    (event) => event.date === activeDate,
  );
  const allPhotos = activities.flatMap((activity) => activity.photos);
  const viewerItems = allPhotos.map(toPhotoViewerItem);
  const firstWeekday =
    (new Date(Date.UTC(currentMonth.year, currentMonth.month - 1, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(
    Date.UTC(currentMonth.year, currentMonth.month, 0),
  ).getUTCDate();
  const monthName = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", {
    month: "short",
    timeZone: "Asia/Shanghai",
  }).format(new Date(Date.UTC(currentMonth.year, currentMonth.month - 1, 15)));
  const selectedDateLabel = new Intl.DateTimeFormat(
    locale === "zh" ? "zh-CN" : "en",
    {
      month: "long",
      day: "numeric",
      weekday: "long",
      timeZone: "Asia/Shanghai",
    },
  ).format(new Date(`${activeDate}T12:00:00+08:00`));

  const changeMonth = (nextIndex: number) => {
    setManualMonthIndex(nextIndex);
    setSelectedDate(null);
  };

  return (
    <>
      <section className={styles.section} aria-labelledby="calendar-title">
        <EditorialSectionHeading
          {...copy.calendarSection}
          id="calendar-title"
        />

        <div className={`${styles.calendarLayout} ${styles.surface}`}>
          <div className={styles.calendarMain}>
            <div className={styles.calendarToolbar}>
              <div className={styles.calendarMonth}>
                <strong>{String(currentMonth.month).padStart(2, "0")}</strong>
                <span>{currentMonth.year} · {monthName.toUpperCase()}</span>
              </div>
              <div className={styles.calendarControls}>
                <button
                  type="button"
                  aria-label={copy.monthPrevious}
                  disabled={monthIndex === 0}
                  onClick={() => changeMonth(monthIndex - 1)}
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label={copy.monthNext}
                  disabled={monthIndex === configuredEventMonths.length - 1}
                  onClick={() => changeMonth(monthIndex + 1)}
                >
                  →
                </button>
              </div>
            </div>

            <div className={styles.weekdays} aria-hidden="true">
              {copy.weekdays.map((weekday) => <span key={weekday}>{weekday}</span>)}
            </div>
            <div className={styles.calendarGrid} aria-label={locale === "zh" ? "活动日历" : "Event calendar"}>
              {Array.from({ length: firstWeekday }, (_, index) => (
                <span key={`empty-${index}`} className={`${styles.calendarDay} ${styles.empty}`} aria-hidden="true" />
              ))}
              {Array.from({ length: daysInMonth }, (_, index) => {
                const day = index + 1;
                const key = dateKey(currentMonth.year, currentMonth.month, day);
                const events = calendarEvents.filter((event) => event.date === key);
                const dayDateLabel = new Intl.DateTimeFormat(
                  locale === "zh" ? "zh-CN" : "en",
                  {
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                    timeZone: "Asia/Shanghai",
                  },
                ).format(new Date(`${key}T12:00:00+08:00`));
                const dayContents = (
                  <>
                    <span className={styles.dayNumber}>{String(day).padStart(2, "0")}</span>
                    {events.length > 0 && (
                      <span className={styles.eventDots} aria-hidden="true">
                        {events.map((event) => <i key={event.id} data-kind={event.kind} />)}
                      </span>
                    )}
                  </>
                );
                const className = [
                  styles.calendarDay,
                  activeDate === key ? styles.selected : "",
                  todayKey === key ? styles.today : "",
                ].filter(Boolean).join(" ");

                return events.length > 0 ? (
                  <button
                    key={key}
                    className={className}
                    type="button"
                    aria-label={`${dayDateLabel}: ${events.map((event) => localize(event.title, locale)).join(locale === "zh" ? "、" : ", ")}`}
                    onClick={() => setSelectedDate(key)}
                  >
                    {dayContents}
                  </button>
                ) : (
                  <span key={key} className={className}>{dayContents}</span>
                );
              })}
            </div>
          </div>

          <aside className={styles.calendarDetail} aria-live="polite">
            <span className={styles.detailLabel}>{copy.selectedDateLabel}</span>
            <h3 className={styles.detailDate}>{selectedDateLabel}</h3>
            <div className={styles.detailEvents}>
              {selectedEvents.length > 0 ? selectedEvents.map((event) => (
                <article key={event.id} className={styles.calendarEvent} data-kind={event.kind}>
                  <span>{localize(event.typeLabel, locale)} · {event.time} UTC+8</span>
                  <h4>{localize(event.title, locale)}</h4>
                  <p>{localize(event.note, locale)}</p>
                </article>
              )) : <p>{copy.emptyDate}</p>}
            </div>
            <div className={styles.legend} aria-label={locale === "zh" ? "活动类型图例" : "Event type legend"}>
              {(["gather", "partner", "class"] as const).map((kind) => (
                <span key={kind}><i data-kind={kind} />{copy.legends[kind]}</span>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionLine}`} aria-labelledby="program-title">
        <EditorialSectionHeading
          {...copy.programSection}
          id="program-title"
        />

        <div className={styles.accordion}>
          {activities.map((activity, activityIndex) => {
            const isOpen = openActivityId === activity.id;
            const panelId = `activity-panel-${activity.id}`;
            const mainPhoto = activity.photos[0];
            const thumbnails = activity.photos.slice(1);

            return (
              <article
                key={activity.id}
                className={`${styles.activity} ${isOpen ? styles.activityOpen : ""}`}
                onMouseEnter={() => {
                  if (window.matchMedia("(hover: hover)").matches) {
                    setOpenActivityId(activity.id);
                  }
                }}
              >
                <button
                  className={styles.activityTrigger}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenActivityId(activity.id)}
                  onFocus={() => setOpenActivityId(activity.id)}
                >
                  <span className={styles.activityIndex}>{String(activityIndex + 1).padStart(2, "0")}</span>
                  <h3>{localize(activity.name, locale)}</h3>
                  <span className={styles.activitySummary}>{localize(activity.summary, locale)}</span>
                  <span className={styles.activityPlus} aria-hidden="true">＋</span>
                </button>
                <div
                  className={styles.activityPanel}
                  id={panelId}
                  aria-hidden={!isOpen}
                  inert={!isOpen}
                >
                  <div className={styles.activityPanelInner}>
                    <div className={styles.activityContent}>
                      <div className={styles.activityCopy}>
                        <p>{localize(activity.description, locale)}</p>
                        <div className={styles.activityMeta}>
                          {activity.meta.map((item) => <span key={item.zh}>{localize(item, locale)}</span>)}
                        </div>
                      </div>
                      <div className={styles.photoMosaic} aria-label={`${localize(activity.name, locale)} · ${copy.photoGroupLabel}`}>
                        <button
                          className={styles.mainPhoto}
                          type="button"
                          aria-label={getPhotoLabel(mainPhoto, locale)}
                          onClick={() => setLightboxIndex(allPhotos.indexOf(mainPhoto))}
                        >
                          <ResponsivePhoto photo={mainPhoto.asset} focalPoint={mainPhoto.focalPoint} alt={getPhotoAlt(mainPhoto, locale)} sizes="(max-width: 820px) 100vw, 43vw" />
                        </button>
                        {thumbnails.length > 0 && (
                          <div className={styles.thumbnailGrid} data-count={thumbnails.length}>
                            {thumbnails.map((photo) => (
                              <button
                                key={photo.id}
                                type="button"
                                aria-label={getPhotoLabel(photo, locale)}
                                onClick={() => setLightboxIndex(allPhotos.indexOf(photo))}
                              >
                                <ResponsivePhoto photo={photo.asset} focalPoint={photo.focalPoint} alt={getPhotoAlt(photo, locale)} sizes="(max-width: 820px) 36vw, 16vw" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {lightboxIndex !== null && (
        <PhotoLightbox
          items={viewerItems}
          initialIndex={lightboxIndex}
          locale={locale}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}

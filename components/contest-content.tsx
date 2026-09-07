import {
  contestChampions,
  contestPageCopy,
  currentContest,
  getContestStatus,
} from "@/content/contests";
import { getPhotoAlt, localize } from "@/content/types";
import type { Locale } from "@/lib/i18n";

import { ContestStatusBadge } from "./contest-status-badge";
import { ContestChampionGallery } from "./contest-champion-gallery";
import { EditorialSectionHeading } from "./editorial-section-heading";
import { ResponsivePhoto } from "./responsive-photo";
import styles from "./contest-content.module.css";

interface ContestContentProps {
  locale: Locale;
}

export function ContestContent({ locale }: ContestContentProps) {
  const copy = contestPageCopy[locale];
  const serverStatus = getContestStatus(currentContest, new Date());
  const ruleColumns = [
    { id: "participation", rules: copy.rules.slice(0, 3) },
    { id: "prizes", rules: copy.rules.slice(3) },
  ];

  return (
    <>
      <section className={styles.section} aria-labelledby="current-contest-title">
        <EditorialSectionHeading
          {...copy.currentSection}
          id="current-contest-title"
        />

        <article className={`${styles.current} ${styles.surface}`}>
          <div className={styles.currentCopy}>
            <div>
              <div className={styles.currentTopline}>
                <span className={styles.issue}>PRISM THEME · {currentContest.issue}</span>
                <ContestStatusBadge
                  contest={currentContest}
                  labels={copy.status}
                  locale={locale}
                  serverStatus={serverStatus}
                />
              </div>
              <h3 className={styles.theme}>
                {localize(currentContest.theme, locale)}
                <small>{localize(currentContest.subtitle, locale)}</small>
              </h3>
              <p className={styles.summary}>{localize(currentContest.summary, locale)}</p>
              <div className={`${styles.dates} ${styles.currentDates}`}>
                <div className={styles.date}>
                  <span>{copy.submissionPeriod}</span>
                  <strong>{currentContest.submissionDisplay}</strong>
                </div>
              </div>
            </div>
            <div className={styles.buttonRow}>
              {currentContest.submissionUrl && (
                <a className={`${styles.button} ${styles.primaryButton}`} href={currentContest.submissionUrl} target="_blank" rel="noopener noreferrer">
                  {copy.submissionLink}
                </a>
              )}
              {currentContest.votingUrl && (
                <a className={`${styles.button} ${styles.primaryButton}`} href={currentContest.votingUrl} target="_blank" rel="noopener noreferrer">
                  {copy.votingLink}
                </a>
              )}
              <a className={styles.button} href="#contest-rules">{copy.rulesLink}</a>
            </div>
          </div>
          <div className={styles.currentVisual}>
            <ResponsivePhoto
              photo={currentContest.visual.asset}
              focalPoint={currentContest.visual.focalPoint}
              alt={getPhotoAlt(currentContest.visual, locale)}
              sizes="(max-width: 820px) 100vw, 48vw"
            />
          </div>
        </article>
      </section>

      <section className={`${styles.section} ${styles.tightSection}`} id="contest-rules" aria-labelledby="rules-title">
        <EditorialSectionHeading {...copy.rulesSection} id="rules-title" />
        <div className={styles.rulesLayout}>
          <div className={styles.callout}>{copy.callout}</div>
          <div className={styles.ruleColumns}>
            {ruleColumns.map((column) => (
              <dl className={styles.rules} key={column.id}>
                {column.rules.map((rule) => (
                  <div className={styles.rule} key={rule.label}>
                    <dt>{rule.label}</dt>
                    <dd>{rule.body}{rule.restriction && <> <span>{rule.restriction}</span></>}</dd>
                  </div>
                ))}
              </dl>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionLine}`} aria-labelledby="champions-title">
        <EditorialSectionHeading {...copy.archiveSection} id="champions-title" />
        <ContestChampionGallery
          champions={contestChampions}
          championLabel={copy.championLabel}
          locale={locale}
          photographyBy={copy.photographyBy}
        />
      </section>
    </>
  );
}

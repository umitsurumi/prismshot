export function isPhotoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function dateFromFilename(basename: string): string | undefined {
  const dates = [...basename.matchAll(/(?:^|-)(\d{4}-\d{2}-\d{2})(?=-|$)/g)].map((match) => match[1]);
  if (dates.length > 1 || dates.some((date) => !isPhotoDate(date))) {
    throw new Error(`${basename}: invalid or ambiguous filename date`);
  }
  return dates[0];
}

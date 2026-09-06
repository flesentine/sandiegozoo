export type VisitMeta = {
  hours: string;
  openTime?: string;
  closeTime?: string;
  event?: {
    title: string;
    detail: string;
  };
};

/**
 * Temporary UX fixture seam.
 *
 * The production data layer will replace this with source-dated Zoo records.
 * Keeping it outside React prevents screen code from becoming the authority
 * for hours and event schedules.
 */
export function getVisitMeta(date: string): VisitMeta {
  if (date === "2026-09-19" || date === "2026-09-20") {
    return {
      hours: "9:00 AM–8:00 PM",
      openTime: "09:00",
      closeTime: "20:00",
      event: {
        title: "Wild Weekend: African Forest",
        detail: "Special activities and wildlife care specialist talks today.",
      },
    };
  }

  return {
    hours: "Hours refresh for your selected date",
  };
}

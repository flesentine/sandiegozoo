export const SAN_DIEGO_ZOO_TIME_ZONE =
  "America/Los_Angeles" as const;

export function zooOperationalDateAt(
  nowMs: number,
) {
  if (!Number.isFinite(nowMs)) {
    throw new Error(
      "Planner 24 Zoo operational date requires a finite timestamp.",
    );
  }

  const parts = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone:
        SAN_DIEGO_ZOO_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).formatToParts(new Date(nowMs));

  const values = new Map(
    parts.map((part) => [
      part.type,
      part.value,
    ]),
  );
  const year = values.get("year");
  const month = values.get("month");
  const day = values.get("day");

  if (!year || !month || !day) {
    throw new Error(
      "Planner 24 could not resolve the San Diego Zoo local calendar date.",
    );
  }

  return `${year}-${month}-${day}`;
}

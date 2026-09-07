import {
  ANIMAL_OPTIONS,
  getExperienceSchedule,
} from "../data/priorityOptions";
import { getVisitMeta } from "../data/visitMeta";
import type { DayPreferences, FoodCategory } from "./dayPreferences";
import type { PriorityPreferences } from "./priorityPreferences";
import type { VisitPreferences } from "./visitPreferences";

export type DaySummaryPreview = {
  mustSees: string[];
  favorites: string[];
  experiences: {
    id: string;
    title: string;
    priority: "interested" | "must";
    timing: string;
  }[];
  reservation: {
    name: string;
    time: string;
  } | null;
  foodSummary: string;
  lunchSummary: string;
  paceSummary: string;
  routeSummary: string[];
  scheduleConfidence: "reference" | "unknown";
};

const FOOD_LABELS: Record<FoodCategory, string> = {
  anything: "Flexible dining",
  pizza: "Pizza",
  burgers: "Burgers",
  mexican: "Mexican",
  chicken: "Chicken",
  light: "Light meals",
  sandwiches: "Sandwiches",
  coffee: "Coffee & breakfast",
  treats: "Treats",
  "grab-go": "Grab & go",
};

const LUNCH_LABELS: Record<DayPreferences["lunchStyle"], string> = {
  quick: "Quick lunch",
  balanced: "Balanced lunch stop",
  experience: "Make lunch part of the day",
};

const PACE_LABELS: Record<DayPreferences["pace"], string> = {
  relaxed: "Relaxed pace",
  balanced: "Balanced pace",
  maximize: "Maximize the day",
};

export function buildDaySummaryPreview(
  visit: VisitPreferences,
  priorities: PriorityPreferences,
  day: DayPreferences,
): DaySummaryPreview {
  const mustSees = ANIMAL_OPTIONS.filter(
    (animal) => priorities.animals[animal.id] === "must",
  ).map((animal) => animal.name);

  const favorites = ANIMAL_OPTIONS.filter(
    (animal) => priorities.animals[animal.id] === "favorite",
  ).map((animal) => animal.name);

  const schedule = getExperienceSchedule(visit.date);
  const experiences = schedule.options.flatMap((experience) => {
    const priority = priorities.experiences[experience.id];

    if (priority !== "interested" && priority !== "must") {
      return [];
    }

    return [
      {
        id: experience.id,
        title: experience.title,
        priority,
        timing: experience.multiplePerformances
          ? "Best performance chosen during route build"
          : experience.time,
      },
    ];
  });

  const reservationName = visit.reservation.name.trim();
  const reservation =
    reservationName && visit.reservation.time
      ? {
          name: reservationName,
          time: visit.reservation.time,
        }
      : null;

  const foodSummary = day.foodCategories
    .map((category) => FOOD_LABELS[category])
    .join(" · ");

  const routeSummary = [
    visit.easyPaths ? "Prefer easier paths" : "Standard route difficulty",
    day.useSkyfari ? "Skyfari allowed when useful" : "No Skyfari",
    visit.stroller ? "Stroller-friendly routing" : null,
    visit.wheelchair ? "Accessible route constraints" : null,
  ].filter((item): item is string => Boolean(item));

  const visitMeta = getVisitMeta(visit.date);

  return {
    mustSees,
    favorites,
    experiences,
    reservation,
    foodSummary,
    lunchSummary: LUNCH_LABELS[day.lunchStyle],
    paceSummary: PACE_LABELS[day.pace],
    routeSummary,
    scheduleConfidence:
      schedule.confidence === "fixture" && visitMeta.openTime && visitMeta.closeTime
        ? "reference"
        : "unknown",
  };
}

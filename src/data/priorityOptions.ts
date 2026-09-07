export type AnimalOption = {
  id: string;
  name: string;
  zone: string;
  imageUrl: string;
  imageAlt: string;
};

export type ExperienceOption = {
  id: string;
  title: string;
  time: string;
  location: string;
  multiplePerformances?: boolean;
};

export type ExperienceSchedule = {
  options: readonly ExperienceOption[];
  confidence: "fixture" | "unknown";
};

export const ANIMAL_OPTIONS: readonly AnimalOption[] = [
  {
    id: "panda",
    name: "Pandas",
    zone: "Panda Ridge",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Giant_panda_animal.jpg",
    imageAlt: "Giant panda",
  },
  {
    id: "tiger",
    name: "Tigers",
    zone: "Tiger Trail",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Tiger_panthera_tigris.jpg",
    imageAlt: "Tiger",
  },
  {
    id: "koala",
    name: "Koalas",
    zone: "Australian Outback",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Koala_Phascolarctos_cinereus.jpg",
    imageAlt: "Koala",
  },
  {
    id: "gorilla",
    name: "Gorillas",
    zone: "Gorilla Tropics",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Hiding_Gorilla.jpg",
    imageAlt: "Gorilla",
  },
] as const;

const REFERENCE_EXPERIENCES: readonly ExperienceOption[] = [
  {
    id: "wildlife-wonders",
    title: "Wildlife Wonders",
    time: "2:00 PM",
    location: "Discovery Theater",
    multiplePerformances: true,
  },
  {
    id: "wildlife-ambassadors",
    title: "Wildlife Ambassadors",
    time: "1:00 PM",
    location: "Wildlife Explorers Basecamp",
    multiplePerformances: true,
  },
] as const;

/**
 * Temporary UX schedule fixture seam.
 *
 * Never project a fixture schedule onto another visit date. The production
 * data layer will replace this with source-dated Zoo event records.
 */
export function getExperienceSchedule(date: string): ExperienceSchedule {
  if (date === "2026-09-19" || date === "2026-09-20") {
    return {
      options: REFERENCE_EXPERIENCES,
      confidence: "fixture",
    };
  }

  return {
    options: [],
    confidence: "unknown",
  };
}

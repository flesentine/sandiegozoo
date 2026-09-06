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

/**
 * Temporary UX schedule fixture.
 *
 * The production data layer will replace this with source-dated Zoo event
 * records. The planner consumes IDs and priority state, not these labels.
 */
export const EXPERIENCE_OPTIONS: readonly ExperienceOption[] = [
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

export type AnimalPriority = "none" | "favorite" | "must";
export type ExperiencePriority = "none" | "interested" | "must";

export type PriorityPreferences = {
  animals: Record<string, AnimalPriority>;
  experiences: Record<string, ExperiencePriority>;
};

export function createDefaultPriorityPreferences(): PriorityPreferences {
  return {
    animals: {},
    experiences: {},
  };
}

export function nextAnimalPriority(current: AnimalPriority): AnimalPriority {
  if (current === "none") return "favorite";
  if (current === "favorite") return "must";
  return "none";
}

export function nextExperiencePriority(
  current: ExperiencePriority,
): ExperiencePriority {
  if (current === "none") return "interested";
  if (current === "interested") return "must";
  return "none";
}

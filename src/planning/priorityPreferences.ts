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

export function retainAvailableExperiencePriorities(
  value: PriorityPreferences,
  availableExperienceIds: readonly string[],
): PriorityPreferences {
  const available = new Set(availableExperienceIds);
  const experiences = Object.fromEntries(
    Object.entries(value.experiences).filter(
      ([id, priority]) => priority !== "none" && available.has(id),
    ),
  ) as Record<string, ExperiencePriority>;

  return {
    ...value,
    experiences,
  };
}

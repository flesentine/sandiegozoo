export const FOOD_CATEGORIES = [
  "anything",
  "pizza",
  "burgers",
  "mexican",
  "chicken",
  "light",
  "sandwiches",
  "coffee",
  "treats",
  "grab-go",
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];
export type LunchStyle = "quick" | "balanced" | "experience";
export type Pace = "relaxed" | "balanced" | "maximize";

export type DayPreferences = {
  foodCategories: FoodCategory[];
  lunchStyle: LunchStyle;
  pace: Pace;
  useSkyfari: boolean;
};

export function createDefaultDayPreferences(): DayPreferences {
  return {
    foodCategories: ["anything"],
    lunchStyle: "balanced",
    pace: "balanced",
    useSkyfari: true,
  };
}

export function toggleFoodCategory(
  selected: readonly FoodCategory[],
  category: FoodCategory,
): FoodCategory[] {
  if (category === "anything") {
    return ["anything"];
  }

  const withoutAnything = selected.filter((item) => item !== "anything");

  if (withoutAnything.includes(category)) {
    const next = withoutAnything.filter((item) => item !== category);
    return next.length > 0 ? next : ["anything"];
  }

  return [...withoutAnything, category];
}

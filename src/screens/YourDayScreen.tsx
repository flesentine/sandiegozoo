import {
  FOOD_CATEGORIES,
  toggleFoodCategory,
  type DayPreferences,
  type FoodCategory,
  type LunchStyle,
  type Pace,
} from "../planning/dayPreferences";

type YourDayScreenProps = {
  value: DayPreferences;
  onChange: (value: DayPreferences) => void;
  easyPaths: boolean;
  onEasyPathsChange: (value: boolean) => void;
  onBack: () => void;
  onContinue?: () => void;
};

const FOOD_LABELS: Record<
  FoodCategory,
  { label: string; icon: string; detail: string }
> = {
  anything: { label: "Anything", icon: "✦", detail: "Keep it flexible" },
  pizza: { label: "Pizza", icon: "🍕", detail: "Slices & pies" },
  burgers: { label: "Burgers", icon: "🍔", detail: "Burgers & fries" },
  mexican: { label: "Mexican", icon: "🌮", detail: "Tacos & bowls" },
  chicken: { label: "Chicken", icon: "🍗", detail: "Chicken favorites" },
  light: { label: "Light", icon: "🥗", detail: "Salads & lighter fare" },
  sandwiches: { label: "Sandwiches", icon: "🥪", detail: "Easy handhelds" },
  coffee: { label: "Coffee", icon: "☕", detail: "Coffee & breakfast" },
  treats: { label: "Treats", icon: "🍦", detail: "Dessert stops" },
  "grab-go": { label: "Grab & go", icon: "⚡", detail: "Fastest options" },
};

const LUNCH_OPTIONS: readonly {
  id: LunchStyle;
  title: string;
  detail: string;
  icon: string;
}[] = [
  {
    id: "quick",
    title: "Just feed us",
    detail: "Keep the stop quick and convenient.",
    icon: "⚡",
  },
  {
    id: "balanced",
    title: "Balanced",
    detail: "A good meal without derailing the day.",
    icon: "◐",
  },
  {
    id: "experience",
    title: "Make lunch part of the day",
    detail: "Allow more time for a nicer meal stop.",
    icon: "✦",
  },
];

const PACE_OPTIONS: readonly {
  id: Pace;
  title: string;
  detail: string;
  icon: string;
}[] = [
  {
    id: "relaxed",
    title: "Relaxed",
    detail: "More breathing room, breaks, and fewer stops.",
    icon: "◡",
  },
  {
    id: "balanced",
    title: "Balanced",
    detail: "A smart mix of wildlife, walking, and breaks.",
    icon: "◐",
  },
  {
    id: "maximize",
    title: "Maximize",
    detail: "Fit in more with smaller schedule buffers.",
    icon: "↗",
  },
];

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 5-7 7 7 7" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 18c5 0 2-8 7-8h1" />
    </svg>
  );
}

function SkyfariIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 5h18M8 5l1.2 4h5.6L16 5" />
      <rect x="8" y="9" width="8" height="7" rx="2" />
      <path d="M10 19h4M12 16v3" />
    </svg>
  );
}

export function YourDayScreen({
  value,
  onChange,
  easyPaths,
  onEasyPathsChange,
  onBack,
  onContinue,
}: YourDayScreenProps) {
  const toggleFood = (category: FoodCategory) => {
    onChange({
      ...value,
      foodCategories: toggleFoodCategory(value.foodCategories, category),
    });
  };

  return (
    <main className="day-page">
      <section className="day-shell" aria-labelledby="day-title">
        <header className="day-topbar">
          <button
            type="button"
            className="day-back"
            onClick={onBack}
            aria-label="Back to What Matters Most"
          >
            <BackIcon />
          </button>

          <div className="day-brand">
            <span aria-hidden="true">◒</span>
            <strong>WildRoute</strong>
          </div>

          <span className="day-step">Step 3 of 4</span>
        </header>

        <div className="day-heading">
          <p className="eyebrow">Preferences</p>
          <h1 id="day-title">Your Day</h1>
          <p>
            Give WildRoute a feel for how your group likes to eat, move, and
            explore. You can change any of this later.
          </p>
        </div>

        <section className="day-section" aria-labelledby="food-heading">
          <div className="day-section__heading">
            <div>
              <h2 id="food-heading">What sounds good?</h2>
              <p>Pick a few favorites, or keep food completely flexible.</p>
            </div>
            <span>{value.foodCategories.length} selected</span>
          </div>

          <div className="day-food-wrap">
            <div
              className="day-food-strip"
              role="group"
              aria-label="Food preferences"
            >
              {FOOD_CATEGORIES.map((category) => {
                const option = FOOD_LABELS[category];
                const selected = value.foodCategories.includes(category);

                return (
                  <button
                    key={category}
                    type="button"
                    className="day-food-card"
                    data-selected={selected || undefined}
                    aria-pressed={selected}
                    onClick={() => toggleFood(category)}
                  >
                    <span className="day-food-card__icon" aria-hidden="true">
                      {option.icon}
                    </span>
                    <strong>{option.label}</strong>
                    <span>{option.detail}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <p className="day-scroll-hint">Swipe for more food choices →</p>
        </section>

        <section className="day-section" aria-labelledby="lunch-heading">
          <div className="day-section__heading">
            <div>
              <h2 id="lunch-heading">Lunch style</h2>
              <p>How much should lunch shape the route?</p>
            </div>
          </div>

          <div className="day-choice-stack" role="radiogroup" aria-labelledby="lunch-heading">
            {LUNCH_OPTIONS.map((option) => {
              const selected = value.lunchStyle === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className="day-choice-card"
                  role="radio"
                  aria-checked={selected}
                  data-selected={selected || undefined}
                  onClick={() => onChange({ ...value, lunchStyle: option.id })}
                >
                  <span className="day-choice-card__icon" aria-hidden="true">
                    {option.icon}
                  </span>
                  <span className="day-choice-card__copy">
                    <strong>{option.title}</strong>
                    <span>{option.detail}</span>
                  </span>
                  <span className="day-choice-card__check" aria-hidden="true">
                    {selected ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="day-section" aria-labelledby="pace-heading">
          <div className="day-section__heading">
            <div>
              <h2 id="pace-heading">Pace</h2>
              <p>We use this to tune buffers, breaks, and stop count.</p>
            </div>
          </div>

          <div className="day-pace-grid" role="radiogroup" aria-labelledby="pace-heading">
            {PACE_OPTIONS.map((option) => {
              const selected = value.pace === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className="day-pace-card"
                  role="radio"
                  aria-checked={selected}
                  data-selected={selected || undefined}
                  onClick={() => onChange({ ...value, pace: option.id })}
                >
                  <span className="day-pace-card__icon" aria-hidden="true">
                    {option.icon}
                  </span>
                  <strong>{option.title}</strong>
                  <span>{option.detail}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="day-section" aria-labelledby="route-heading">
          <div className="day-section__heading">
            <div>
              <h2 id="route-heading">Getting around</h2>
              <p>These choices affect the route, not your priorities.</p>
            </div>
          </div>

          <div className="day-toggle-stack">
            <label className="day-toggle-row">
              <span className="day-toggle-row__icon"><RouteIcon /></span>
              <span className="day-toggle-row__copy">
                <strong>Prefer easier paths</strong>
                <span>Avoid steeper routes when practical.</span>
              </span>
              <input
                type="checkbox"
                checked={easyPaths}
                onChange={(event) => onEasyPathsChange(event.target.checked)}
              />
              <span className="day-toggle" aria-hidden="true" />
            </label>

            <label className="day-toggle-row">
              <span className="day-toggle-row__icon"><SkyfariIcon /></span>
              <span className="day-toggle-row__copy">
                <strong>Use Skyfari when useful</strong>
                <span>Let the planner use it when it saves effort or time.</span>
              </span>
              <input
                type="checkbox"
                checked={value.useSkyfari}
                onChange={(event) =>
                  onChange({ ...value, useSkyfari: event.target.checked })
                }
              />
              <span className="day-toggle" aria-hidden="true" />
            </label>
          </div>
        </section>

        <aside className="day-smart-defaults">
          <span aria-hidden="true">✦</span>
          <p>
            These are preferences, not promises. Accessibility needs and locked
            reservations always take priority over convenience settings.
          </p>
        </aside>

        <div className="day-footer">
          <button type="button" className="day-continue" onClick={onContinue}>
            Continue
            <ArrowIcon />
          </button>
        </div>
      </section>
    </main>
  );
}

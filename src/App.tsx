import { useState } from "react";
import { getExperienceSchedule } from "./data/priorityOptions";
import {
  createDefaultDayPreferences,
  type DayPreferences,
} from "./planning/dayPreferences";
import {
  createDefaultPriorityPreferences,
  retainAvailableExperiencePriorities,
  type PriorityPreferences,
} from "./planning/priorityPreferences";
import {
  createDefaultVisitPreferences,
  type VisitPreferences,
} from "./planning/visitPreferences";
import { DaySummaryScreen } from "./screens/DaySummaryScreen";
import { PrioritiesScreen } from "./screens/PrioritiesScreen";
import { YourDayScreen } from "./screens/YourDayScreen";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { YourVisitScreen } from "./screens/YourVisitScreen";
import "./styles/welcome.css";
import "./styles/visit.css";
import "./styles/priorities.css";
import "./styles/day.css";
import "./styles/summary.css";

type AppScreen = "welcome" | "visit" | "priorities" | "day" | "summary";

export function App() {
  const [screen, setScreen] = useState<AppScreen>("welcome");
  const [visitPreferences, setVisitPreferences] = useState<VisitPreferences>(
    createDefaultVisitPreferences,
  );
  const [priorityPreferences, setPriorityPreferences] =
    useState<PriorityPreferences>(createDefaultPriorityPreferences);
  const [dayPreferences, setDayPreferences] = useState<DayPreferences>(
    createDefaultDayPreferences,
  );

  const updateVisitPreferences = (next: VisitPreferences) => {
    if (next.date && next.date !== visitPreferences.date) {
      const availableExperienceIds = getExperienceSchedule(next.date).options.map(
        (experience) => experience.id,
      );

      setPriorityPreferences((current) =>
        retainAvailableExperiencePriorities(current, availableExperienceIds),
      );
    }

    setVisitPreferences(next);
  };

  if (screen === "summary") {
    return (
      <DaySummaryScreen
        visit={visitPreferences}
        priorities={priorityPreferences}
        day={dayPreferences}
        onBack={() => setScreen("day")}
      />
    );
  }

  if (screen === "day") {
    return (
      <YourDayScreen
        value={dayPreferences}
        onChange={setDayPreferences}
        easyPaths={visitPreferences.easyPaths}
        onEasyPathsChange={(easyPaths) =>
          setVisitPreferences((current) => ({ ...current, easyPaths }))
        }
        onBack={() => setScreen("priorities")}
        onContinue={() => setScreen("summary")}
      />
    );
  }

  if (screen === "priorities") {
    return (
      <PrioritiesScreen
        visitDate={visitPreferences.date}
        value={priorityPreferences}
        onChange={setPriorityPreferences}
        onBack={() => setScreen("visit")}
        onContinue={() => setScreen("day")}
      />
    );
  }

  if (screen === "visit") {
    return (
      <YourVisitScreen
        value={visitPreferences}
        onChange={updateVisitPreferences}
        onBack={() => setScreen("welcome")}
        onContinue={() => setScreen("priorities")}
      />
    );
  }

  return <WelcomeScreen onPlan={() => setScreen("visit")} />;
}

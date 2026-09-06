import { useState } from "react";
import {
  createDefaultPriorityPreferences,
  type PriorityPreferences,
} from "./planning/priorityPreferences";
import {
  createDefaultVisitPreferences,
  type VisitPreferences,
} from "./planning/visitPreferences";
import { PrioritiesScreen } from "./screens/PrioritiesScreen";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { YourVisitScreen } from "./screens/YourVisitScreen";
import "./styles/welcome.css";
import "./styles/visit.css";
import "./styles/priorities.css";

type AppScreen = "welcome" | "visit" | "priorities";

export function App() {
  const [screen, setScreen] = useState<AppScreen>("welcome");
  const [visitPreferences, setVisitPreferences] = useState<VisitPreferences>(
    createDefaultVisitPreferences,
  );
  const [priorityPreferences, setPriorityPreferences] =
    useState<PriorityPreferences>(createDefaultPriorityPreferences);

  if (screen === "priorities") {
    return (
      <PrioritiesScreen
        visitDate={visitPreferences.date}
        value={priorityPreferences}
        onChange={setPriorityPreferences}
        onBack={() => setScreen("visit")}
        onContinue={() => {
          // UX-10.4 will replace this with the Your Day preferences screen.
        }}
      />
    );
  }

  if (screen === "visit") {
    return (
      <YourVisitScreen
        value={visitPreferences}
        onChange={setVisitPreferences}
        onBack={() => setScreen("welcome")}
        onContinue={() => setScreen("priorities")}
      />
    );
  }

  return <WelcomeScreen onPlan={() => setScreen("visit")} />;
}

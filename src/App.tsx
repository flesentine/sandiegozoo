import { useState } from "react";
import {
  createDefaultVisitPreferences,
  type VisitPreferences,
} from "./planning/visitPreferences";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { YourVisitScreen } from "./screens/YourVisitScreen";
import "./styles/welcome.css";
import "./styles/visit.css";

type AppScreen = "welcome" | "visit";

export function App() {
  const [screen, setScreen] = useState<AppScreen>("welcome");
  const [visitPreferences, setVisitPreferences] = useState<VisitPreferences>(
    createDefaultVisitPreferences,
  );

  if (screen === "visit") {
    return (
      <YourVisitScreen
        value={visitPreferences}
        onChange={setVisitPreferences}
        onBack={() => setScreen("welcome")}
        onContinue={() => {
          // UX-10.3 will replace this with the Priorities screen.
          // Visit preferences already live above the screen boundary so they
          // survive forward/back navigation.
        }}
      />
    );
  }

  return <WelcomeScreen onPlan={() => setScreen("visit")} />;
}

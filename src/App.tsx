import { useState } from "react";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { YourVisitScreen } from "./screens/YourVisitScreen";
import "./styles/welcome.css";
import "./styles/visit.css";

type AppScreen = "welcome" | "visit";

export function App() {
  const [screen, setScreen] = useState<AppScreen>("welcome");

  if (screen === "visit") {
    return (
      <YourVisitScreen
        onBack={() => setScreen("welcome")}
        onContinue={() => {
          // UX-10.3 will replace this with the Priorities screen.
        }}
      />
    );
  }

  return <WelcomeScreen onPlan={() => setScreen("visit")} />;
}

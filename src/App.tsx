import { BottomNav } from "./components/ui/BottomNav";
import { PrimaryButton } from "./components/ui/PrimaryButton";
import { StatusBadge } from "./components/ui/StatusBadge";
import { SurfaceCard } from "./components/ui/SurfaceCard";

export function App() {
  return (
    <main className="foundation-page">
      <section className="foundation-shell" aria-labelledby="foundation-title">
        <header className="foundation-header">
          <div className="brand-mark" aria-hidden="true">◒</div>
          <div>
            <p className="eyebrow">WildRoute</p>
            <h1 id="foundation-title">UX foundation</h1>
            <p className="foundation-copy">
              Design tokens and reusable primitives for the frozen WildRoute experience.
            </p>
          </div>
        </header>

        <SurfaceCard>
          <p className="eyebrow">Priority language</p>
          <div className="badge-row">
            <StatusBadge tone="must">🔥 Must-See</StatusBadge>
            <StatusBadge tone="favorite">♥ Favorite</StatusBadge>
            <StatusBadge tone="timed">◷ Timed</StatusBadge>
            <StatusBadge tone="locked">▣ Reservation</StatusBadge>
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <p className="eyebrow">Primary action</p>
          <PrimaryButton>Continue</PrimaryButton>
        </SurfaceCard>

        <BottomNav active="next" />
      </section>
    </main>
  );
}

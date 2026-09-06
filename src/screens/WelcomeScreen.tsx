import { useState } from "react";

const HERO_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/e/ee/Zoo_Atlanta_Giraffe_%2814233976984%29.jpg";

type WelcomeIntent = "quick" | "at-zoo";

type WelcomeScreenProps = {
  onPlan?: () => void;
};

function LeafMark() {
  return (
    <svg
      className="welcome-brand__mark"
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      <path d="M31 37C12 34 8 17 9 8c15 1 26 7 29 20-1 4-3 7-7 9Z" />
      <path d="M34 31C36 15 48 7 58 7c0 14-5 27-20 31-3-2-4-4-4-7Z" />
      <path d="M31 34c4 8 7 14 8 22" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3v3M17 3v3M4.5 8.5h15M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <path d="M8 12h2M14 12h2M8 16h2M14 16h2" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m13.5 2-8 12H11l-.5 8 8-12H13l.5-8Z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2" />
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

export function WelcomeScreen({ onPlan }: WelcomeScreenProps) {
  const [intent, setIntent] = useState<WelcomeIntent | null>(null);

  return (
    <main className="welcome-page">
      <section className="welcome-shell" aria-labelledby="welcome-title">
        <header className="welcome-header">
          <div className="welcome-brand" aria-label="WildRoute">
            <LeafMark />
            <h1 id="welcome-title">WildRoute</h1>
          </div>
          <p className="welcome-tagline">
            Your perfect day at the Zoo,
            <br />
            continuously replanned.
          </p>
        </header>

        <div className="welcome-hero">
          <img
            src={HERO_IMAGE}
            alt="Giraffe standing in a leafy zoo habitat"
            className="welcome-hero__image"
          />
          <div className="welcome-hero__shade" aria-hidden="true" />
          <p className="welcome-hero__note">
            Curiosity leads to
            <br />
            a wilder day.
          </p>
        </div>

        <div className="welcome-actions" aria-label="Start WildRoute">
          <button
            type="button"
            className="welcome-action welcome-action--primary"
            onClick={onPlan}
          >
            <span className="welcome-action__icon"><CalendarIcon /></span>
            <span>Plan a Zoo Day</span>
            <span className="welcome-action__arrow"><ArrowIcon /></span>
          </button>

          <button
            type="button"
            className="welcome-action welcome-action--secondary"
            onClick={() => setIntent("quick")}
          >
            <span className="welcome-action__icon"><BoltIcon /></span>
            <span>Quick Plan</span>
            <span className="welcome-action__arrow"><ArrowIcon /></span>
          </button>

          <button
            type="button"
            className="welcome-action welcome-action--tertiary"
            onClick={() => setIntent("at-zoo")}
          >
            <span className="welcome-action__icon"><PinIcon /></span>
            <span>I’m at the Zoo Now</span>
            <span className="welcome-action__arrow"><ArrowIcon /></span>
          </button>
        </div>

        <p className="welcome-disclaimer">
          Unofficial San Diego Zoo day planner
        </p>

        <div className="welcome-landscape" aria-hidden="true">
          <span className="welcome-landscape__hill welcome-landscape__hill--1" />
          <span className="welcome-landscape__hill welcome-landscape__hill--2" />
          <span className="welcome-landscape__palm welcome-landscape__palm--1" />
          <span className="welcome-landscape__palm welcome-landscape__palm--2" />
        </div>

        <div className="welcome-topography" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>

        {intent ? (
          <p className="welcome-intent" role="status" aria-live="polite">
            {intent === "quick" && "Opening Quick Plan…"}
            {intent === "at-zoo" && "Starting from your current Zoo visit…"}
          </p>
        ) : null}
      </section>
    </main>
  );
}

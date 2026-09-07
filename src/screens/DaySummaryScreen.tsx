import { useMemo, useState } from "react";
import {
  buildDaySummaryPreview,
  type DaySummaryPreview,
} from "../planning/daySummaryPreview";
import type { DayPreferences } from "../planning/dayPreferences";
import type { PriorityPreferences } from "../planning/priorityPreferences";
import type { VisitPreferences } from "../planning/visitPreferences";

type DaySummaryScreenProps = {
  visit: VisitPreferences;
  priorities: PriorityPreferences;
  day: DayPreferences;
  onBack: () => void;
};

type LocationState =
  | "closed"
  | "intro"
  | "requesting"
  | "enabled"
  | "manual"
  | "unavailable";

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

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

function WalkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="4.5" r="2" />
      <path d="m10.5 8-2 5 3 2 1.5 5M13.5 8l2 4 3 1M11.5 10l4 2" />
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

function formatTime(value: string) {
  const [hourText, minute] = value.split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
}

function PriorityList({
  title,
  empty,
  items,
  tone,
}: {
  title: string;
  empty: string;
  items: string[];
  tone: "must" | "favorite";
}) {
  return (
    <section className="summary-list-card">
      <div className="summary-list-card__heading">
        <span className={`summary-dot summary-dot--${tone}`} aria-hidden="true" />
        <h2>{title}</h2>
        <span>{items.length}</span>
      </div>
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item}>
              <strong>{item}</strong>
              <span>{tone === "must" ? "Protected" : "Preferred"}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>{empty}</p>
      )}
    </section>
  );
}

function LocationSheet({
  state,
  onEnable,
  onManual,
  onClose,
}: {
  state: LocationState;
  onEnable: () => void;
  onManual: () => void;
  onClose: () => void;
}) {
  return (
    <div className="summary-modal" role="presentation">
      <button
        type="button"
        className="summary-modal__scrim"
        aria-label="Close location setup"
        onClick={onClose}
      />
      <section
        className="summary-location-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-title"
      >
        <span className="summary-location-sheet__handle" aria-hidden="true" />
        <div className="summary-location-sheet__icon"><PinIcon /></div>

        {state === "intro" ? (
          <>
            <p className="eyebrow">Start My Day</p>
            <h2 id="location-title">Use your location during the visit?</h2>
            <p>
              WildRoute can keep your NEXT recommendation current as you move
              around the Zoo. GPS is optional—you can always choose where you
              are manually.
            </p>
            <div className="summary-location-actions">
              <button type="button" className="summary-location-primary" onClick={onEnable}>
                Enable location
              </button>
              <button type="button" className="summary-location-secondary" onClick={onManual}>
                Not now
              </button>
            </div>
            <small>
              WildRoute does not need to retain your movement history to use
              your current position.
            </small>
          </>
        ) : null}

        {state === "requesting" ? (
          <>
            <p className="eyebrow">Location</p>
            <h2 id="location-title">Waiting for permission…</h2>
            <p>Your browser or device may ask whether WildRoute can use your location.</p>
          </>
        ) : null}

        {state === "enabled" ? (
          <>
            <p className="eyebrow">Location</p>
            <h2 id="location-title">Location is enabled</h2>
            <p>
              WildRoute can use your current position for live recommendations.
              Exact route matching comes with the live routing layer.
            </p>
            <button type="button" className="summary-location-primary" onClick={onClose}>
              Done
            </button>
          </>
        ) : null}

        {state === "manual" || state === "unavailable" ? (
          <>
            <p className="eyebrow">Location</p>
            <h2 id="location-title">
              {state === "manual" ? "Continue without location" : "Location wasn’t enabled"}
            </h2>
            <p>
              That’s okay. WildRoute can still work with a manually confirmed
              current location.
            </p>
            <button type="button" className="summary-location-primary" onClick={onClose}>
              Done
            </button>
          </>
        ) : null}
      </section>
    </div>
  );
}

export function DaySummaryScreen({
  visit,
  priorities,
  day,
  onBack,
}: DaySummaryScreenProps) {
  const summary = useMemo(
    () => buildDaySummaryPreview(visit, priorities, day),
    [visit, priorities, day],
  );
  const [locationState, setLocationState] = useState<LocationState>("closed");

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationState("unavailable");
      return;
    }

    setLocationState("requesting");
    navigator.geolocation.getCurrentPosition(
      () => setLocationState("enabled"),
      () => setLocationState("unavailable"),
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  return (
    <main className="summary-page">
      <section className="summary-shell" aria-labelledby="summary-title">
        <header className="summary-topbar">
          <button
            type="button"
            className="summary-back"
            onClick={onBack}
            aria-label="Back to Your Day"
          >
            <BackIcon />
          </button>

          <div className="summary-brand">
            <span aria-hidden="true">◒</span>
            <strong>WildRoute</strong>
          </div>

          <span className="summary-step">Step 4 of 4</span>
        </header>

        <section className="summary-hero">
          <p className="eyebrow">Planning preview</p>
          <h1 id="summary-title">Your day looks great.</h1>
          <p>
            We have your priorities and preferences. The routing engine will
            make the final feasibility and walking calculations before live use.
          </p>

          <div className="summary-hero__stats">
            <div>
              <strong>{summary.mustSees.length}</strong>
              <span>Must-Sees</span>
            </div>
            <div>
              <strong>{summary.favorites.length}</strong>
              <span>Favorites</span>
            </div>
            <div>
              <strong>{summary.experiences.length + (summary.reservation ? 1 : 0)}</strong>
              <span>Timed / locked</span>
            </div>
          </div>
        </section>

        <div className="summary-readiness" role="status">
          <span aria-hidden="true">✦</span>
          <div>
            <strong>Ready for route build</strong>
            <p>
              Feasibility has not been claimed yet. WildRoute will never silently
              drop a Must-See if protected constraints conflict.
            </p>
          </div>
        </div>

        {summary.scheduleConfidence === "unknown" ? (
          <aside className="summary-warning">
            <ClockIcon />
            <div>
              <strong>Schedule refresh needed</strong>
              <p>
                Current Zoo hours or presentation data isn’t confirmed for this
                date yet. Refresh before starting the live day.
              </p>
            </div>
          </aside>
        ) : (
          <aside className="summary-confidence">
            <ClockIcon />
            <div>
              <strong>Reference schedule loaded</strong>
              <p>
                This preview uses the current reference fixture. Live Zoo data
                still needs a final refresh before the visit.
              </p>
            </div>
          </aside>
        )}

        <div className="summary-priority-grid">
          <PriorityList
            title="Must-Sees"
            empty="No Must-Sees selected yet."
            items={summary.mustSees}
            tone="must"
          />
          <PriorityList
            title="Favorites"
            empty="No favorites selected yet."
            items={summary.favorites}
            tone="favorite"
          />
        </div>

        <section className="summary-section" aria-labelledby="anchors-heading">
          <div className="summary-section__heading">
            <div>
              <p className="eyebrow">Protected timing</p>
              <h2 id="anchors-heading">Timed & locked anchors</h2>
            </div>
          </div>

          <div className="summary-anchor-list">
            {summary.reservation ? (
              <article className="summary-anchor">
                <span className="summary-anchor__icon"><LockIcon /></span>
                <div>
                  <strong>{summary.reservation.name}</strong>
                  <span>{formatTime(summary.reservation.time)} · Locked reservation</span>
                </div>
              </article>
            ) : null}

            {summary.experiences.map((experience) => (
              <article className="summary-anchor" key={experience.id}>
                <span className="summary-anchor__icon"><ClockIcon /></span>
                <div>
                  <strong>{experience.title}</strong>
                  <span>
                    {experience.priority === "must" ? "Must attend" : "Interested"} · {experience.timing}
                  </span>
                </div>
              </article>
            ))}

            {!summary.reservation && summary.experiences.length === 0 ? (
              <p className="summary-empty">No timed or locked anchors selected.</p>
            ) : null}
          </div>
        </section>

        <section className="summary-section" aria-labelledby="day-shape-heading">
          <div className="summary-section__heading">
            <div>
              <p className="eyebrow">Day shape</p>
              <h2 id="day-shape-heading">Food, pace & routing</h2>
            </div>
          </div>

          <div className="summary-detail-list">
            <div>
              <span>Food</span>
              <strong>{summary.foodSummary}</strong>
            </div>
            <div>
              <span>Lunch</span>
              <strong>{summary.lunchSummary}</strong>
            </div>
            <div>
              <span>Pace</span>
              <strong>{summary.paceSummary}</strong>
            </div>
            <div>
              <span>Route</span>
              <strong>{summary.routeSummary.join(" · ")}</strong>
            </div>
          </div>
        </section>

        <section className="summary-walking" aria-label="Estimated walking">
          <span className="summary-walking__icon"><WalkIcon /></span>
          <div>
            <span>Estimated walking</span>
            <strong>Route estimate pending</strong>
            <p>Calculated from the verified Zoo walking graph during route build.</p>
          </div>
        </section>

        <section className="summary-bonus">
          <span aria-hidden="true">✨</span>
          <div>
            <strong>Bonus opportunities</strong>
            <p>
              Optional nearby stops will be added only after protected priorities
              and timed anchors fit.
            </p>
          </div>
        </section>

        <div className="summary-footer">
          <button
            type="button"
            className="summary-start"
            onClick={() => setLocationState("intro")}
          >
            Start My Day
            <ArrowIcon />
          </button>
          <p>Location is optional and requested only when you start the live day.</p>
        </div>
      </section>

      {locationState !== "closed" ? (
        <LocationSheet
          state={locationState}
          onEnable={requestLocation}
          onManual={() => setLocationState("manual")}
          onClose={() => setLocationState("closed")}
        />
      ) : null}
    </main>
  );
}

import { useMemo, useState } from "react";

type YourVisitScreenProps = {
  onBack: () => void;
  onContinue?: () => void;
};

type PartyKey = "adults" | "kids";

type VisitMeta = {
  hours: string;
  event?: {
    title: string;
    detail: string;
  };
};

const REFERENCE_DATE = "2026-09-19";

function visitMetaFor(date: string): VisitMeta {
  if (date === "2026-09-19" || date === "2026-09-20") {
    return {
      hours: "9:00 AM–8:00 PM",
      event: {
        title: "Wild Weekend: African Forest",
        detail: "Special activities and wildlife care specialist talks today.",
      },
    };
  }

  return {
    hours: "Hours refresh for your selected date",
  };
}

function formatLongDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 5-7 7 7 7" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3v3M17 3v3M4.5 8.5h15M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
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

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3.5 20v-2a5.5 5.5 0 0 1 11 0v2M14.5 15.5A4.5 4.5 0 0 1 21 19.5V20" />
    </svg>
  );
}

function StrollerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 5h3l2.2 7.3h6.5a3.3 3.3 0 0 0 3.1-2.2l.7-2.1H10" />
      <path d="M10.2 12.3 8.8 16H18" />
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="18" cy="19" r="1.5" />
    </svg>
  );
}

function AccessIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="4.5" r="2" />
      <path d="M8 9h8M12 7v5M9.5 12l-2.5 7M14.5 12l2.5 7" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8.5V6h16v2.5a2.5 2.5 0 0 0 0 5V16H4v-2.5a2.5 2.5 0 0 0 0-5Z" />
      <path d="M12 7.5v7" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" />
      <path d="m18.5 14 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" />
    </svg>
  );
}

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="visit-stepper">
      <span>{label}</span>
      <div className="visit-stepper__controls">
        <button
          type="button"
          aria-label={`Remove one ${label.toLowerCase()}`}
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value === 0}
        >
          −
        </button>
        <strong aria-live="polite">{value}</strong>
        <button
          type="button"
          aria-label={`Add one ${label.toLowerCase()}`}
          onClick={() => onChange(Math.min(12, value + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function YourVisitScreen({ onBack, onContinue }: YourVisitScreenProps) {
  const [date, setDate] = useState(REFERENCE_DATE);
  const [arrival, setArrival] = useState("09:00");
  const [departure, setDeparture] = useState("17:00");
  const [party, setParty] = useState({ adults: 2, kids: 1 });
  const [stroller, setStroller] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [easyPaths, setEasyPaths] = useState(false);
  const [wheelchair, setWheelchair] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [reservationName, setReservationName] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const meta = useMemo(() => visitMetaFor(date), [date]);
  const invalidTime = departure <= arrival;

  const updateParty = (key: PartyKey, value: number) => {
    setParty((current) => ({ ...current, [key]: value }));
  };

  const continuePlanning = () => {
    setSubmitted(true);
    if (!invalidTime && party.adults + party.kids > 0) {
      onContinue?.();
    }
  };

  return (
    <main className="visit-page">
      <section className="visit-shell" aria-labelledby="visit-title">
        <header className="visit-topbar">
          <button type="button" className="visit-back" onClick={onBack} aria-label="Back to Welcome">
            <BackIcon />
          </button>

          <div className="visit-brand">
            <span aria-hidden="true">◒</span>
            <strong>WildRoute</strong>
          </div>

          <span className="visit-step">Step 1 of 4</span>
        </header>

        <div className="visit-heading">
          <p className="eyebrow">Plan</p>
          <h1 id="visit-title">Your Visit</h1>
          <p>Tell us when you’re coming. We’ll shape the whole day around it.</p>
        </div>

        <label className="visit-date-card">
          <span className="visit-date-card__icon"><CalendarIcon /></span>
          <span className="visit-date-card__copy">
            <span className="visit-date-card__label">Visit date</span>
            <strong>{formatLongDate(date)}</strong>
            <span>{meta.hours}</span>
          </span>
          <input
            type="date"
            value={date}
            min="2026-09-06"
            onChange={(event) => setDate(event.target.value)}
            aria-label="Visit date"
          />
        </label>

        {meta.event ? (
          <aside className="visit-event" aria-label="Special event today">
            <span className="visit-event__icon"><SparkIcon /></span>
            <div>
              <span>Special event today</span>
              <strong>{meta.event.title}</strong>
              <p>{meta.event.detail}</p>
            </div>
          </aside>
        ) : null}

        <section className="visit-card" aria-labelledby="visit-time-title">
          <div className="visit-card__title">
            <span><ClockIcon /></span>
            <div>
              <h2 id="visit-time-title">How long is your day?</h2>
              <p>We’ll keep protected stops inside this window.</p>
            </div>
          </div>

          <div className="visit-time-grid">
            <label>
              <span>Arrive</span>
              <input
                type="time"
                value={arrival}
                onChange={(event) => setArrival(event.target.value)}
              />
            </label>
            <label>
              <span>Leave</span>
              <input
                type="time"
                value={departure}
                onChange={(event) => setDeparture(event.target.value)}
                aria-invalid={invalidTime}
              />
            </label>
          </div>

          {invalidTime ? (
            <p className="visit-error" role="alert">Leave time must be later than arrival.</p>
          ) : null}
        </section>

        <section className="visit-card" aria-labelledby="visit-party-title">
          <div className="visit-card__title">
            <span><PeopleIcon /></span>
            <div>
              <h2 id="visit-party-title">Who’s coming?</h2>
              <p>This helps us estimate pace and breaks.</p>
            </div>
          </div>

          <div className="visit-steppers">
            <Stepper label="Adults" value={party.adults} onChange={(value) => updateParty("adults", value)} />
            <Stepper label="Kids" value={party.kids} onChange={(value) => updateParty("kids", value)} />
          </div>

          {submitted && party.adults + party.kids === 0 ? (
            <p className="visit-error" role="alert">Add at least one person to continue.</p>
          ) : null}
        </section>

        <section className="visit-options" aria-label="Visit details">
          <label className="visit-option visit-option--toggle">
            <span className="visit-option__icon"><StrollerIcon /></span>
            <span className="visit-option__copy">
              <strong>Stroller</strong>
              <span>Keep routes stroller-friendly</span>
            </span>
            <input
              type="checkbox"
              checked={stroller}
              onChange={(event) => setStroller(event.target.checked)}
            />
            <span className="visit-toggle" aria-hidden="true" />
          </label>

          <button
            type="button"
            className="visit-option"
            aria-expanded={accessOpen}
            onClick={() => setAccessOpen((open) => !open)}
          >
            <span className="visit-option__icon"><AccessIcon /></span>
            <span className="visit-option__copy">
              <strong>Mobility & accessibility</strong>
              <span>{easyPaths || wheelchair ? "Preferences added" : "Add route needs"}</span>
            </span>
            <span className="visit-option__chevron"><ChevronIcon /></span>
          </button>

          {accessOpen ? (
            <div className="visit-detail-panel">
              <label>
                <input
                  type="checkbox"
                  checked={easyPaths}
                  onChange={(event) => setEasyPaths(event.target.checked)}
                />
                <span>
                  <strong>Prefer easier paths</strong>
                  <small>Avoid steep routes when practical.</small>
                </span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={wheelchair}
                  onChange={(event) => setWheelchair(event.target.checked)}
                />
                <span>
                  <strong>Wheelchair / mobility device</strong>
                  <small>Use accessible paths and elevators as hard constraints.</small>
                </span>
              </label>
            </div>
          ) : null}

          <button
            type="button"
            className="visit-option"
            aria-expanded={reservationOpen}
            onClick={() => setReservationOpen((open) => !open)}
          >
            <span className="visit-option__icon"><TicketIcon /></span>
            <span className="visit-option__copy">
              <strong>Add reservation</strong>
              <span>{reservationName ? reservationName : "Tour or booked experience"}</span>
            </span>
            <span className="visit-option__chevron"><ChevronIcon /></span>
          </button>

          {reservationOpen ? (
            <div className="visit-detail-panel visit-detail-panel--reservation">
              <label>
                <span>Experience</span>
                <input
                  type="text"
                  value={reservationName}
                  onChange={(event) => setReservationName(event.target.value)}
                  placeholder="e.g. Early Morning with Pandas"
                />
              </label>
              <label>
                <span>Start time</span>
                <input
                  type="time"
                  value={reservationTime}
                  onChange={(event) => setReservationTime(event.target.value)}
                />
              </label>
              <p>Booked experiences become locked anchors in your day.</p>
            </div>
          ) : null}
        </section>

        <div className="visit-footer">
          <p>Schedules will refresh from official Zoo data before your visit.</p>
          <button type="button" className="visit-continue" onClick={continuePlanning}>
            Continue
            <ChevronIcon />
          </button>
        </div>
      </section>
    </main>
  );
}

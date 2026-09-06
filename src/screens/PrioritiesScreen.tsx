import {
  ANIMAL_OPTIONS,
  getExperienceSchedule,
  type AnimalOption,
  type ExperienceOption,
} from "../data/priorityOptions";
import {
  nextAnimalPriority,
  nextExperiencePriority,
  type AnimalPriority,
  type ExperiencePriority,
  type PriorityPreferences,
} from "../planning/priorityPreferences";

type PrioritiesScreenProps = {
  visitDate: string;
  value: PriorityPreferences;
  onChange: (value: PriorityPreferences) => void;
  onBack: () => void;
  onContinue?: () => void;
};

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

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" />
    </svg>
  );
}

function animalPriorityLabel(priority: AnimalPriority) {
  if (priority === "favorite") return "♥ Favorite";
  if (priority === "must") return "🔥 Must-See";
  return "+ Add";
}

function experiencePriorityLabel(priority: ExperiencePriority) {
  if (priority === "interested") return "♥ Interested";
  if (priority === "must") return "🔥 Must";
  return "+ Add";
}

function animalNextLabel(priority: AnimalPriority) {
  if (priority === "none") return "Favorite";
  if (priority === "favorite") return "Must-See";
  return "not selected";
}

function experienceNextLabel(priority: ExperiencePriority) {
  if (priority === "none") return "Interested";
  if (priority === "interested") return "Must";
  return "not selected";
}

function AnimalCard({
  animal,
  priority,
  onChange,
}: {
  animal: AnimalOption;
  priority: AnimalPriority;
  onChange: () => void;
}) {
  return (
    <article className="priority-animal-card" data-priority={priority}>
      <div className="priority-animal-card__photo">
        <img
          src={animal.imageUrl}
          alt={animal.imageAlt}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
        <div className="priority-animal-card__shade" aria-hidden="true" />
        <div className="priority-animal-card__copy">
          <strong>{animal.name}</strong>
          <span>{animal.zone}</span>
        </div>
      </div>

      <button
        type="button"
        className="priority-state-button"
        data-priority={priority}
        onClick={onChange}
        aria-label={`${animal.name} priority: ${animalPriorityLabel(priority)}. Change to ${animalNextLabel(priority)}.`}
      >
        {animalPriorityLabel(priority)}
      </button>
    </article>
  );
}

function ExperienceCard({
  experience,
  priority,
  onChange,
}: {
  experience: ExperienceOption;
  priority: ExperiencePriority;
  onChange: () => void;
}) {
  return (
    <article className="priority-experience-card" data-priority={priority}>
      <div className="priority-experience-card__icon">
        <SparkIcon />
      </div>

      <div className="priority-experience-card__copy">
        <strong>{experience.title}</strong>
        <span>
          <ClockIcon />
          {experience.time} · {experience.location}
        </span>
      </div>

      <button
        type="button"
        className="priority-state-button priority-state-button--experience"
        data-priority={priority}
        onClick={onChange}
        aria-label={`${experience.title} priority: ${experiencePriorityLabel(priority)}. Change to ${experienceNextLabel(priority)}.`}
      >
        {experiencePriorityLabel(priority)}
      </button>
    </article>
  );
}

export function PrioritiesScreen({
  visitDate,
  value,
  onChange,
  onBack,
  onContinue,
}: PrioritiesScreenProps) {
  const experienceSchedule = getExperienceSchedule(visitDate);

  const animalPriority = (id: string): AnimalPriority =>
    value.animals[id] ?? "none";
  const experiencePriority = (id: string): ExperiencePriority =>
    value.experiences[id] ?? "none";

  const changeAnimal = (id: string) => {
    const next = nextAnimalPriority(animalPriority(id));

    onChange({
      ...value,
      animals: {
        ...value.animals,
        [id]: next,
      },
    });
  };

  const changeExperience = (id: string) => {
    const next = nextExperiencePriority(experiencePriority(id));

    onChange({
      ...value,
      experiences: {
        ...value.experiences,
        [id]: next,
      },
    });
  };

  const selectedAnimalCount = Object.values(value.animals).filter(
    (priority) => priority !== "none",
  ).length;

  return (
    <main className="priorities-page">
      <section className="priorities-shell" aria-labelledby="priorities-title">
        <header className="priorities-topbar">
          <button
            type="button"
            className="priorities-back"
            onClick={onBack}
            aria-label="Back to Your Visit"
          >
            <BackIcon />
          </button>

          <div className="priorities-brand">
            <span aria-hidden="true">◒</span>
            <strong>WildRoute</strong>
          </div>

          <span className="priorities-step">Step 2 of 4</span>
        </header>

        <div className="priorities-heading">
          <p className="eyebrow">Priorities</p>
          <h1 id="priorities-title">What matters most?</h1>
          <p>
            Mark favorites and Must-Sees. WildRoute protects the things you care
            about most when the day changes.
          </p>
        </div>

        <section className="priorities-section" aria-labelledby="wildlife-heading">
          <div className="priorities-section__heading">
            <div>
              <h2 id="wildlife-heading">Wildlife</h2>
              <p>Tap the priority control to move from Favorite to Must-See.</p>
            </div>
            <span>{selectedAnimalCount} selected</span>
          </div>

          <div className="priority-animal-grid">
            {ANIMAL_OPTIONS.map((animal) => (
              <AnimalCard
                key={animal.id}
                animal={animal}
                priority={animalPriority(animal.id)}
                onChange={() => changeAnimal(animal.id)}
              />
            ))}
          </div>
        </section>

        <section
          className="priorities-section priorities-section--experiences"
          aria-labelledby="experiences-heading"
        >
          <div className="priorities-section__heading">
            <div>
              <h2 id="experiences-heading">Today’s experiences</h2>
              <p>Tell us what matters; the planner handles the timing.</p>
            </div>
          </div>

          <div className="priority-experience-list">
            {experienceSchedule.options.length > 0 ? (
              experienceSchedule.options.map((experience) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  priority={experiencePriority(experience.id)}
                  onChange={() => changeExperience(experience.id)}
                />
              ))
            ) : (
              <div className="priority-schedule-empty" role="status">
                <strong>Schedule refresh needed</strong>
                <span>
                  Today’s presentations will appear after the Zoo schedule is
                  refreshed for your selected date.
                </span>
              </div>
            )}
          </div>

          <aside className="priority-performance-note">
            <SparkIcon />
            <p>
              WildRoute will choose the best performance when multiple times are
              available. You can pin a specific time later.
            </p>
          </aside>
        </section>

        <div className="priorities-footer">
          <button type="button" className="priorities-continue" onClick={onContinue}>
            Continue
            <ArrowIcon />
          </button>
        </div>
      </section>
    </main>
  );
}

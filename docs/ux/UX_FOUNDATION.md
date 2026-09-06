# WildRoute UX Foundation

**Status:** Frozen baseline  
**Phase:** UX-9B  
**Purpose:** Define the product interaction model that all implementation PRs must preserve unless a later UX decision explicitly revises this document.

## Product promise

WildRoute continuously answers:

> Given where this group is, what matters to them, how much time remains, what is happening at the Zoo today, and how the day has changed, what is the smartest thing to do next?

The optimizer may be complex. The interface must remain calm.

## Experience model

WildRoute has three modes.

### PLAN

Before the visit, the visitor gives WildRoute enough information to build a useful day.

Primary flow:

1. Welcome
2. Your Visit
3. What Matters Most
4. Your Day
5. Day Summary
6. Start My Day

A **Quick Plan** path asks only for date/duration and Must-Sees, then uses balanced defaults.

### GO

Once the visit starts, the default experience changes to **NEXT**.

The live visitor should be able to answer **Where should I go now?** within roughly one second of opening the app.

Live navigation is frozen to three destinations:

- **Next**
- **Map**
- **My Day**

Do not reintroduce generic tabs such as Explore, Schedule, or More without a specific UX decision.

### ADAPT

One persistent **Change Plans** entry point handles real-world changes:

- Something is unavailable
- We are hungry
- We are tired
- Add an animal
- Stay here longer
- Change a show
- We are leaving earlier
- Find restroom
- Head toward exit

The user changes constraints; WildRoute rebuilds the plan.

## Interaction principles

### One decision at a time

Live mode should not become a dashboard. NEXT prioritizes one recommendation and one obvious primary action.

### Must-See has meaning

**Must-See** is a near-hard planning constraint, not decorative emphasis. The planner must not silently drop it.

### Timed events are protected

A show or presentation with a fixed start has a recommended arrival time. The user should not have to reason backward from show time.

### Reservations are locked

A booked experience is a hard anchor unless the user explicitly changes or removes it.

### Explain recommendations

When useful, NEXT includes one concise reason:

> Best choice now. You'll still reach your 2 PM presentation comfortably.

Avoid exposing scoring formulas.

### Adapt without scolding

Do not label the user late, behind, or failed. When the plan changes, explain the useful consequence.

### GPS improves the product; it does not unlock it

A visitor can use WildRoute without location permission by manually selecting their current location.

Ask for location when the user starts the visit, after the value is clear.

### WildRoute is not turn-by-turn navigation unless it truly is

Use **GO** or **Show Route** for internal route guidance. Apple Maps is the explicit external navigation handoff.

## Information architecture

### Planning

```text
Welcome
  ├─ Plan a Zoo Day
  ├─ Quick Plan
  └─ I'm at the Zoo Now

Plan a Zoo Day
  ├─ Your Visit
  ├─ What Matters Most
  │   ├─ Wildlife
  │   └─ Today's experiences
  ├─ Your Day
  │   ├─ Food
  │   ├─ Lunch style
  │   ├─ Pace
  │   └─ Mobility / route preferences
  └─ Day Summary
```

### Live

```text
Next
  ├─ Go
  ├─ Another option
  ├─ Map
  ├─ Apple Maps
  └─ Change Plans

Map
  ├─ Current location
  ├─ Current route
  └─ Destination sheet

My Day
  ├─ Must-Sees
  ├─ Timed anchors
  └─ Flexible itinerary
```

## Visual language

Frozen direction:

- warm off-white / cream base
- deep botanical green primary
- warm clay Must-See accent
- premium wildlife photography
- elegant serif for major titles and destination names
- clean sans-serif for controls, times, distances, and body copy
- rounded cards and large outdoor-readable controls
- subtle contour/path motifs
- handwritten copy only as a rare decorative accent

### Branding labels

- Show **NEXT** only on the live recommendation screen.
- Show **MAP** on the map screen.
- Planning screens do not carry the NEXT label beneath the logo.
- Decorative slogans are optional and should be sparse in production.

## Outdoor and one-handed use

- primary controls live within comfortable thumb reach where possible
- minimum interactive target: 44 × 44 CSS px
- primary action target: at least 56 px high
- critical text must survive bright outdoor conditions
- do not rely on subtle low-contrast gray for essential information
- do not rely on color alone for priority or status

## Map principle

The approved map artwork is a **visual style reference only**.

Production geography must come from:

- verified attraction coordinates
- verified guest navigation points
- real route graph nodes and edges
- real terrain/accessibility metadata

Generated illustration must never be used as geographic truth.

## Default behavior

Defaults should make setup fast:

- food: Anything convenient
- pace: Balanced
- walking: standard route
- Skyfari: use when useful
- accessibility: no special constraint unless selected

## Out of V1 UX scope

Do not add these merely because they look attractive in mockups:

- social accounts
- gamification
- AI chatbot
- crowd prediction presented as fact
- animal activity prediction presented as fact
- elaborate share/scrapbook experience

The core experience remains: **plan → next recommendation → adapt**.

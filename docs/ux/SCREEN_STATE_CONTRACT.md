# WildRoute Screen & State Contract

**Status:** Frozen baseline for implementation  
**Phase:** UX-9B

This document defines behavior that the ImageGen references cannot show. Every production screen must support its required states before it is considered complete.

## 1. Welcome

### Normal
Actions:

- Plan a Zoo Day
- Quick Plan
- I'm at the Zoo Now

### Resume available
If a valid in-progress visit exists, surface a clear **Resume My Day** action without removing the normal planning options.

### Offline
Planning can begin from cached data. Clearly indicate that current Zoo schedule validation may be unavailable.

## 2. Your Visit

Required fields:

- visit date
- arrival time
- departure time
- party

Optional:

- stroller
- mobility & accessibility details
- reservation

### Validation states

- departure must be later than arrival
- visit window must intersect known Zoo operating hours
- if operating hours are unavailable, allow progress but mark schedule confidence as stale/unknown
- a reservation opens a detail flow; it is never represented as a simple boolean preference

## 3. What Matters Most

### Animal states

- unselected
- Favorite
- Must-See
- unavailable for selected date
- disabled because data is uncertain only when necessary

Priority must always be represented with text/iconography, never color alone.

### Experience states

- unselected
- Interested
- Must
- booked/locked
- unavailable
- multiple performances available

When multiple performances exist, WildRoute chooses the best performance unless the user explicitly pins a time.

## 4. Your Day

### Food preference states

- unselected
- selected
- dietary constraint
- unavailable category data

The food selector may horizontally scroll; visible affordance must indicate that more choices exist.

### Lunch style

Exactly one:

- Just feed us
- Balanced
- Make lunch part of the day

### Pace

Exactly one:

- Relaxed
- Balanced
- Maximize the day

### Route options

- Prefer easier paths
- Use Skyfari when useful

Accessibility constraints override convenience preferences.

## 5. Day Summary

### Feasible
Show:

- Must-Sees planned / selected
- favorites planned
- bonus opportunities
- presentations
- dining summary
- estimated walking
- locked/timed anchors

### Partially feasible
Never silently omit a Must-See.

Explain the conflict and offer explicit choices such as:

- stay longer
- remove a Must-See
- reduce optional stops
- build best possible plan

### Schedule confidence degraded
If current schedule data is stale, display that clearly before Start My Day.

## 6. Location permission transition

Ask for location when the visitor selects **Start My Day**.

Explain the value before the system permission prompt.

Actions:

- Enable location
- Not now

Choosing Not now still enters live mode.

## 7. NEXT

This is the most important state machine in the product.

### Recommendation ready

Must show:

- destination
- priority/status
- walking estimate
- concise reason when useful
- primary GO action
- Another option
- Map
- Apple Maps

### Calculating

Show a lightweight state such as:

> Updating your best next stop…

Do not block the entire app if the current plan remains usable.

### GPS uncertain

Show:

> Finding your position…

Provide **Choose where I am**.

Never assert a precise location from weak evidence.

### Location denied

Continue using the last manually confirmed/current location and provide **Update my location**.

### Offline

The cached plan and local routing remain available.

Show:

> You're offline. Your downloaded plan still works; live Zoo updates may be unavailable.

### Destination unavailable

Do not strand the visitor.

Surface:

> This stop isn't available right now.

Provide immediate replan and the **Something's unavailable** change-plan path.

### Timed event approaching

NEXT can change priority as the protected arrival window approaches.

States:

- normal
- leave soon
- head there now

Use calm language, not alarms.

### No feasible protected plan

If all remaining protected constraints cannot fit, explain the conflict and request one explicit decision. Do not silently downgrade a Must-See or reservation.

## 8. Another Option

Show a small ranked set, not a directory.

Typical alternatives:

- another Must-See
- nearby Favorite
- useful food/rest stop

Choosing one replans immediately.

## 9. Map

### Normal

Show:

- visitor position
- highlighted route
- next destination
- only relevant nearby POIs
- bottom destination sheet

### GPS uncertain

Use an uncertainty halo or clear text state and offer manual current-location selection.

### Offline

Cached map, route graph, and plan remain functional.

### Geographic contract

The production map must never copy the generated reference geography.

## 10. My Day

Show flexible structure rather than a minute-by-minute obligation.

Use exact times only for:

- booked reservations
- timed presentations
- recommended arrival deadlines

Flexible animals/meals can be grouped into morning/midday/afternoon.

## 11. Change Plans

Required actions:

1. Something's unavailable
2. We're hungry
3. We're tired
4. Add an animal
5. Stay here longer
6. Change a show
7. We're leaving earlier
8. Find restroom
9. Head toward exit

Each action changes optimizer constraints and returns the user to a useful recommendation.

### We're tired

Levels:

- slow down
- cut some walking
- only Must-Sees
- start wrapping up

### Stay here longer

Offer:

- +10 min
- +20 min
- no rush

If a protected event becomes risky, explain the tradeoff before applying it.

### Head toward exit

Options may include:

- easiest route
- finish Must-Sees
- best final hour
- treat + exit

## 12. Global error principles

- preserve the user's current plan whenever possible
- never erase selections on transient network failure
- distinguish **unknown** from **unavailable**
- do not manufacture real-time certainty
- present a next action with every recoverable error

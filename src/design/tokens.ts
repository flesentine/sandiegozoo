export const priorityTones = {
  must: "must",
  favorite: "favorite",
  timed: "timed",
  locked: "locked",
} as const;

export type PriorityTone = keyof typeof priorityTones;

export const liveTabs = ["next", "map", "my-day"] as const;
export type LiveTab = (typeof liveTabs)[number];

export const accessibilityContract = {
  minimumInteractiveSizePx: 44,
  primaryActionHeightPx: 56,
  colorOnlyMeaningAllowed: false,
  reducedMotionSupported: true,
} as const;

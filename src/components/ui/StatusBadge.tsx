import type { PropsWithChildren } from "react";
import type { PriorityTone } from "../../design/tokens";

type StatusBadgeProps = PropsWithChildren<{
  tone: PriorityTone;
}>;

export function StatusBadge({ children, tone }: StatusBadgeProps) {
  return <span className={`wr-badge wr-badge--${tone}`}>{children}</span>;
}

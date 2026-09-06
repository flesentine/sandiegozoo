import type { PropsWithChildren } from "react";

export function SurfaceCard({ children }: PropsWithChildren) {
  return <section className="wr-card">{children}</section>;
}

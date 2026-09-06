import type { LiveTab } from "../../design/tokens";

type BottomNavProps = {
  active: LiveTab;
  onChange?: (tab: LiveTab) => void;
};

const items: ReadonlyArray<{ id: LiveTab; label: string; glyph: string }> = [
  { id: "next", label: "Next", glyph: "⌂" },
  { id: "map", label: "Map", glyph: "◇" },
  { id: "my-day", label: "My Day", glyph: "□" },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="wr-bottom-nav" aria-label="Live visit">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="wr-bottom-nav__item"
          aria-current={active === item.id ? "page" : undefined}
          onClick={() => onChange?.(item.id)}
        >
          <span aria-hidden="true">{item.glyph}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

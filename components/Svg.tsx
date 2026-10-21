// Small building blocks for inline SVG diagrams; colours come from the notebook CSS variables

/** Arrowheads: url(#<id>a) accent, url(#<id>b) bad, url(#<id>c) ok, url(#<id>d) warn, url(#<id>e) muted */
export const Markers = ({ id }: { id: string }) => (
  <defs>
    {[["a", "var(--accent)"], ["b", "var(--bad)"], ["c", "var(--ok)"], ["d", "var(--warn)"], ["e", "var(--muted)"]].map(([k, c]) => (
      <marker key={k} id={`${id}${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill={c} />
      </marker>
    ))}
  </defs>
);

/** Rounded box with a bold title and an optional muted subtitle, both centred */
export const Box = ({ x, y, w, h = 50, title, sub, cls = "s-box" }: {
  x: number; y: number; w: number; h?: number; title: string; sub?: string; cls?: string;
}) => (
  <g>
    <rect className={cls} x={x} y={y} width={w} height={h} rx="7" />
    <text className="s-tb" x={x + w / 2} y={sub ? y + h / 2 - 2 : y + h / 2 + 5} textAnchor="middle">{title}</text>
    {sub && <text className="s-tm" x={x + w / 2} y={y + h / 2 + 15} textAnchor="middle">{sub}</text>}
  </g>
);

/** Muted mono label; pass a CSS colour variable to tint it */
export const Label = ({ x, y, children, color, anchor }: {
  x: number; y: number; children: string; color?: string; anchor?: "start" | "middle" | "end";
}) => (
  <text className="s-tm" x={x} y={y} textAnchor={anchor} style={color ? { fill: color } : undefined}>{children}</text>
);

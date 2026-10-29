import { Box, Markers } from "@/components/Svg";

export interface FlowStep { title: string; sub?: string; hl?: boolean }

/** Left-to-right chain of boxes joined by arrows; the box width shrinks as the chain grows */
export function Flow({ id, label, steps, caption }: { id: string; label: string; steps: FlowStep[]; caption?: string }) {
  const n = steps.length;
  const w = n <= 4 ? 170 : n <= 6 ? 140 : 120;
  const gap = 34;
  const pad = 16;
  const W = pad * 2 + n * w + (n - 1) * gap;
  return (
    <figure className="fig">
      <div className="scroll">
        <svg viewBox={`0 0 ${W} 90`} role="img" aria-label={label} style={{ minWidth: Math.min(W, 700) }}>
          <Markers id={id} />
          {steps.map((s, i) => {
            const x = pad + i * (w + gap);
            return (
              <g key={s.title + i}>
                <Box x={x} y={16} w={w} h={58} title={s.title} sub={s.sub} cls={s.hl ? "s-hl" : "s-box"} />
                {i < n - 1 && <path className="s-ln" d={`M${x + w} 45 H${x + w + gap - 2}`} markerEnd={`url(#${id}a)`} />}
              </g>
            );
          })}
        </svg>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

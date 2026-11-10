// Animated step chain: each step lights up in turn, looping (pure CSS, no client JS)
export interface AnimStep { title: string; sub?: string }

export function AnimFlow({ steps, label, caption, step = 1.1 }: { steps: AnimStep[]; label: string; caption?: string; step?: number }) {
  const total = steps.length * step;
  return (
    <figure className="fig">
      <ol className="af" aria-label={label} style={{ ["--af-total" as string]: `${total}s` }}>
        {steps.map((s, i) => (
          <li key={s.title} style={{ ["--af-delay" as string]: `${i * step}s` }}>
            <span className="af-n">{i + 1}</span>
            <b>{s.title}</b>
            {s.sub && <small>{s.sub}</small>}
          </li>
        ))}
      </ol>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/** Two columns as in the infographic: strengths (green) and limitations (red) */
export function ProsCons({ pros, cons, prosTitle, consTitle }: { pros: string[]; cons: string[]; prosTitle: string; consTitle: string }) {
  return (
    <div className="pc">
      <div className="pc-ok"><h4>{prosTitle}</h4><ul>{pros.map((t) => <li key={t}>{t}</li>)}</ul></div>
      <div className="pc-bad"><h4>{consTitle}</h4><ul>{cons.map((t) => <li key={t}>{t}</li>)}</ul></div>
    </div>
  );
}

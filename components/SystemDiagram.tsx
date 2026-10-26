"use client";

import { createContext, useContext, useEffect, useState, type KeyboardEvent } from "react";

// Nested system design of the e-commerce example: user → edge → region → application cluster → data.
// Shared by the Vietnamese and English wrappers; only the strings differ.

type BoxProps = { x: number; y: number; w: number; h?: number; lines: string[]; kind?: string; id?: string };

// Note shown in the side panel for one box
export interface Info { title: string; what: string; jobs: string[]; cfg?: string }

// Which box is selected, and how to select one
const Pick = createContext<{ sel: string | null; pick: (id: string) => void }>({ sel: null, pick: () => {} });

const Box = ({ x, y, w, h = 46, lines, kind = "s-box", id }: BoxProps) => {
  const { sel, pick } = useContext(Pick);
  const on = id !== undefined && sel === id;
  const body = (
    <>
      <rect className={kind} x={x} y={y} width={w} height={h} rx="7" style={on ? { stroke: "var(--accent)", strokeWidth: 3 } : undefined} />
      {lines.map((l, i) => (
        <text key={l} className={i === 0 ? "s-tb" : "s-tm"} x={x + 9} y={y + 19 + i * 17}>{l}</text>
      ))}
    </>
  );
  if (!id) return <g>{body}</g>;
  const onKey = (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(id); } };
  return (
    <g className="sd-node" role="button" tabIndex={0} aria-pressed={on} aria-label={lines[0]} onClick={() => pick(id)} onKeyDown={onKey}>
      {body}
    </g>
  );
};

// Several identical replicas drawn as a stack
const Pods = (p: BoxProps) => (
  <g>
    <rect className="s-box" x={p.x + 6} y={p.y - 6} width={p.w} height={p.h ?? 46} rx="7" />
    <rect className="s-box" x={p.x + 3} y={p.y - 3} width={p.w} height={p.h ?? 46} rx="7" />
    <Box {...p} />
  </g>
);

// Zone frame with a title in the top-left corner
const Zone = ({ x, y, w, h, title, sub, below, style }: { x: number; y: number; w: number; h: number; title: string; sub?: string; below?: boolean; style: React.CSSProperties }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx="10" style={style} />
    <text className="s-tb" x={x + 12} y={y + 20}>{title}</text>
    {sub && (below
      ? <text className="s-tm" x={x + 12} y={y + 37}>{sub}</text>
      : <text className="s-tm" x={x + w - 12} y={y + 20} textAnchor="end">{sub}</text>)}
  </g>
);

// Left-hand row label inside a frame
const Row = ({ x, y, title, sub }: { x: number; y: number; title: string; sub: string }) => (
  <g>
    <text className="s-tb" x={x} y={y}>{title}</text>
    <text className="s-tm" x={x} y={y + 16}>{sub}</text>
  </g>
);

const COL4 = [160, 297, 434, 571];          // four boxes, width 127
const COL5 = [160, 270, 380, 490, 600];     // five boxes, width 100

export interface DiagramText {
  aria: string;
  users: { title: string; sub: string; items: string[][] };
  edge: { title: string; sub: string; items: string[][] };
  region: { title: string; sub: string };
  nlb: { row: string[]; lines: string[]; arrow: string };
  app: { title: string; sub: string };
  rows: { ingress: string[]; frontend: string[]; gateway: string[]; service: string[]; worker: string[] };
  ingress: string[];
  routes: string[];
  next: string[];
  fe: string[];
  gw: string[];
  services: string[][];
  workers: string[][];
  data: { title: string; sub: string };
  dataRows: { events: string[]; cache: string[]; store: string[]; other: string[] };
  kafka: string[];
  redis: string[];
  pgb: string[];
  stores: string[][];
  es: string[];
  wh: string[];
  side: { cross: string; obs: string[]; cicd: string[]; cfg: string[]; ext: string; pay: string[]; ship: string[] };
  legend: string;
  ui: { hintTitle: string; hint: string; what: string; jobs: string; cfg: string; close: string };
  info: Record<string, Info>;
}

export function SystemDiagram({ t }: { t: DiagramText }) {
  const [sel, setSel] = useState<string | null>(null);
  const info = sel ? t.info[sel] : undefined;

  // Esc closes the popup
  useEffect(() => {
    if (!sel) return;
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") setSel(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel]);

  const pick = (id: string) => {
    setSel(sel === id ? null : id);
  };

  return (
    <Pick.Provider value={{ sel, pick }}>
    <div className="sd">
    <div className="sd-map">
    <svg viewBox="0 0 900 980" role="group" aria-label={t.aria}>
      <defs>
        <marker id="da" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker>
        <marker id="db" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker>
      </defs>

      {/* Users */}
      <Zone x={16} y={8} w={692} h={64} title={t.users.title} sub={t.users.sub} below style={{ fill: "none", stroke: "var(--line)", strokeWidth: 1.5, strokeDasharray: "5 4" }} />
      {t.users.items.map((l, i) => <Box key={l[0]} id={["web", "mobile", "admin", "seller"][i]} x={COL4[i]} y={20} w={127} h={44} lines={l} />)}
      <path className="s-ln" d="M362 72 V90" markerEnd="url(#da)" />

      {/* Edge: rented infrastructure in front of your region */}
      <Zone x={16} y={92} w={692} h={72} title={t.edge.title} sub={t.edge.sub} below style={{ fill: "var(--bg)", stroke: "var(--line)", strokeWidth: 1.5, strokeDasharray: "5 4" }} />
      {t.edge.items.map((l, i) => <Box key={l[0]} id={["geodns", "cdn", "waf", "waiting", "s3miss"][i]} x={COL5[i]} y={104} w={100} h={52} lines={l} />)}
      <path className="s-ln" d="M362 164 V182" markerEnd="url(#da)" />

      {/* Region: your VPC */}
      <Zone x={16} y={184} w={692} h={756} title={t.region.title} sub={t.region.sub} style={{ fill: "none", stroke: "var(--ink)", strokeWidth: 1.5 }} />
      <Row x={30} y={232} title={t.nlb.row[0]} sub={t.nlb.row[1]} />
      <Box id="nlb" x={160} y={216} w={540} kind="s-box" lines={t.nlb.lines} />
      <path className="s-ln" d="M430 262 V280" markerEnd="url(#da)" />
      <text className="s-tm" x="440" y="275">{t.nlb.arrow}</text>

      {/* Application: everything that runs in the Kubernetes cluster */}
      <Zone x={26} y={282} w={672} h={380} title={t.app.title} sub={t.app.sub} style={{ fill: "var(--accent-soft)", stroke: "var(--accent)", strokeWidth: 2 }} />

      <Row x={38} y={338} title={t.rows.ingress[0]} sub={t.rows.ingress[1]} />
      <Pods id="ingress" x={160} y={320} w={532} lines={t.ingress} kind="s-hl" />
      <path className="s-ln" d="M245 372 V382" markerEnd="url(#da)" />
      <text className="s-tm" x="252" y="379">{t.routes[0]}</text>
      <path className="s-ln" d="M420 372 V382" markerEnd="url(#da)" />
      <text className="s-tm" x="427" y="379">{t.routes[1]}</text>
      <path className="s-ln" d="M615 372 V444" markerEnd="url(#da)" />
      <text className="s-tm" x="623" y="412">{t.routes[2]}</text>

      <Row x={38} y={410} title={t.rows.frontend[0]} sub={t.rows.frontend[1]} />
      <Pods id="next" x={160} y={386} w={170} lines={t.next} />
      <Pods id="fe" x={345} y={386} w={165} lines={t.fe} />
      {/* Frontends call the API through the gateway */}
      <path className="s-ln" d="M245 432 V444" markerEnd="url(#da)" />
      <text className="s-tm" x="252" y="442">{t.routes[3]}</text>
      <path className="s-ln" d="M427 432 V444" markerEnd="url(#da)" />

      <Row x={38} y={470} title={t.rows.gateway[0]} sub={t.rows.gateway[1]} />
      <Pods id="gw" x={160} y={450} w={532} lines={t.gw} kind="s-hl" />

      <path className="s-ln" d="M335 496 V510 M210 510 H650" />
      <Row x={38} y={546} title={t.rows.service[0]} sub={t.rows.service[1]} />
      {t.services.map((l, i) => (
        <g key={l[0]}>
          <path className="s-ln" d={`M${COL5[i] + 50} 510 V524`} markerEnd="url(#da)" />
          <Pods id={["user", "catalog", "cart", "order", "payment"][i]} x={COL5[i]} y={532} w={104} lines={l} />
        </g>
      ))}

      <Row x={38} y={618} title={t.rows.worker[0]} sub={t.rows.worker[1]} />
      {t.workers.map((l, i) => <Pods key={l[0]} id={["notification", "search", "inventory", "shipping"][i]} x={COL4[i]} y={600} w={127} lines={l} />)}

      {/* Application → data */}
      <path className="s-ln" d="M300 662 V680" markerEnd="url(#da)" />

      {/* Data: mostly managed services outside the cluster */}
      <Zone x={26} y={682} w={672} h={244} title={t.data.title} sub={t.data.sub} style={{ fill: "var(--bg)", stroke: "var(--line)", strokeWidth: 1.5 }} />

      <Row x={38} y={738} title={t.dataRows.events[0]} sub={t.dataRows.events[1]} />
      <Box id="kafka" x={160} y={712} w={532} kind="s-disk" lines={t.kafka} />
      {/* Workers consume events from Kafka */}
      {[0, 1, 2, 3].map(i => <path key={i} className="s-dl2" d={`M${COL4[i] + 63} 712 V652`} markerEnd="url(#db)" />)}

      <Row x={38} y={794} title={t.dataRows.cache[0]} sub={t.dataRows.cache[1]} />
      <Box id="redis" x={160} y={770} w={395} kind="s-disk" lines={t.redis} />
      <Box id="pgb" x={565} y={770} w={127} kind="s-disk" lines={t.pgb} />

      <Row x={38} y={846} title={t.dataRows.store[0]} sub={t.dataRows.store[1]} />
      {t.stores.map((l, i) => <Box key={l[0]} id={["pg-users", "mongo", "s3", "pg-orders", "pg-payments"][i]} x={COL5[i]} y={828} w={100} h={42} kind="s-disk" lines={l} />)}

      <Row x={38} y={898} title={t.dataRows.other[0]} sub={t.dataRows.other[1]} />
      <Box id="es" x={160} y={880} w={170} h={40} kind="s-disk" lines={t.es} />
      <Box id="wh" x={340} y={880} w={250} h={40} kind="s-bad2" lines={t.wh} />

      {/* Cross-cutting concerns and external providers */}
      <rect className="s-bg" x="718" y="8" width="174" height="212" rx="8" />
      <text className="s-lane" x="730" y="28">{t.side.cross}</text>
      <Box id="obs" x={730} y={38} w={150} lines={t.side.obs} />
      <Box id="cicd" x={730} y={96} w={150} lines={t.side.cicd} />
      <Box id="cfg" x={730} y={154} w={150} lines={t.side.cfg} />
      <rect className="s-bg" x="718" y="500" width="174" height="170" rx="8" />
      <text className="s-lane" x="730" y="520">{t.side.ext}</text>
      <Box id="psp" x={730} y={532} w={150} lines={t.side.pay} />
      <path className="s-ln" d="M712 555 H728" markerStart="url(#da)" markerEnd="url(#da)" />
      <Box id="carrier" x={730} y={606} w={150} lines={t.side.ship} />
      <path className="s-ln" d="M706 623 H728" markerEnd="url(#da)" />

      <text className="s-tm" x="16" y="968">{t.legend}</text>
    </svg>
    </div>

    {info && (
      <div className="sd-modal" onClick={() => setSel(null)}>
        <aside className="sd-panel" role="dialog" aria-modal="true" aria-label={info.title} onClick={e => e.stopPropagation()}>
          <div className="sd-ph">
            <h3>{info.title}</h3>
            <button type="button" autoFocus onClick={() => setSel(null)} aria-label={t.ui.close}>×</button>
          </div>
          <p>{info.what}</p>
          <h4>{t.ui.jobs}</h4>
          <ul>{info.jobs.map(j => <li key={j}>{j}</li>)}</ul>
          {info.cfg && (
            <>
              <h4>{t.ui.cfg}</h4>
              <pre>{info.cfg}</pre>
            </>
          )}
        </aside>
      </div>
    )}
    </div>
    </Pick.Provider>
  );
}

"use client";

/** Opens or closes every question on the page */
export function ExpandAll({ open, close }: { open: string; close: string }) {
  const set = (value: boolean) =>
    document.querySelectorAll<HTMLDetailsElement>("details.qa").forEach(d => { d.open = value; });
  return (
    <div className="qa-tools">
      <button type="button" onClick={() => set(true)}>{open}</button>
      <button type="button" onClick={() => set(false)}>{close}</button>
    </div>
  );
}

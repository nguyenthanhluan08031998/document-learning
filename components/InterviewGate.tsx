"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { Locale } from "@/lib/notebook";
import { lock, unlock, useMounted, useUnlocked } from "@/lib/unlock";

const T = {
  vi: { title: "Đăng nhập", hint: "Đăng nhập để mở phần phỏng vấn.", user: "Tên đăng nhập", pass: "Mật khẩu", submit: "Đăng nhập", cancel: "Huỷ", logout: "Đăng xuất", wrong: "Sai tên đăng nhập hoặc mật khẩu.", unsupported: "Trình duyệt không hỗ trợ, hãy mở trang qua HTTPS hoặc localhost." },
  en: { title: "Log in", hint: "Log in to open the interview section.", user: "Username", pass: "Password", submit: "Log in", cancel: "Cancel", logout: "Log out", wrong: "Wrong username or password.", unsupported: "Unsupported browser; open the page over HTTPS or localhost." },
};

function LoginForm({ locale, onDone, onCancel }: { locale: Locale; onDone?: () => void; onCancel?: () => void }) {
  const t = T[locale];
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = await unlock(String(form.get("user")), String(form.get("pass")));
    if (result === "ok") { onDone?.(); return; }
    setError(t[result]);
  }

  return (
    <form className="iv-login" onSubmit={onSubmit}>
      <h1>{t.title}</h1>
      <p className="iv-hint">{t.hint}</p>
      <label>{t.user}<input name="user" autoComplete="username" required autoFocus /></label>
      <label>{t.pass}<input name="pass" type="password" autoComplete="current-password" required /></label>
      {error && <p className="iv-error" role="alert">{error}</p>}
      <div className="iv-actions">
        {onCancel && <button type="button" className="ghost" onClick={onCancel}>{t.cancel}</button>}
        <button type="submit">{t.submit}</button>
      </div>
    </form>
  );
}

/** Shows children only after login; otherwise a login form (used on interview pages) */
export function InterviewGate({ locale, children }: { locale: Locale; children: ReactNode }) {
  const mounted = useMounted();
  const unlocked = useUnlocked();
  if (!mounted) return <div className="wrap single" aria-busy="true" />;
  if (unlocked) return <>{children}</>;
  return <div className="wrap single"><main><LoginForm locale={locale} /></main></div>;
}

/** Renders children only when logged in; renders nothing otherwise */
export function UnlockedOnly({ children }: { children: ReactNode }) {
  const unlocked = useUnlocked();
  return unlocked ? <>{children}</> : null;
}

/** Header button: opens the login dialog, or logs out when already logged in */
export function LoginButton({ locale }: { locale: Locale }) {
  const t = T[locale];
  const mounted = useMounted();
  const unlocked = useUnlocked();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  if (!mounted) return null;
  if (unlocked) return <button type="button" className="login-btn" onClick={lock}>{t.logout}</button>;

  return (
    <>
      <button type="button" className="login-btn" onClick={() => setOpen(true)}>{t.title}</button>
      <dialog ref={dialog} className="login-dialog" onClose={() => setOpen(false)}>
        {open && <LoginForm locale={locale} onDone={() => setOpen(false)} onCancel={() => setOpen(false)} />}
      </dialog>
    </>
  );
}

import Link from "next/link";

// Static export has one 404 page for both languages, so it shows both
export default function NotFound() {
  return (
    <div className="wrap single">
      <main>
        <header className="hero">
          <div className="eyebrow">404</div>
          <h1>Không tìm thấy trang này · Page not found</h1>
          <p className="lede">Đường dẫn có thể đã đổi. <Link href="/">Về trang Tổng quan</Link>.</p>
          <p className="lede">The link may have changed. <Link href="/en/">Back to the Overview</Link>.</p>
        </header>
      </main>
    </div>
  );
}

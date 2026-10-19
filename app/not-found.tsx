import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap single">
      <main>
        <header className="hero">
          <div className="eyebrow">404</div>
          <h1>Không tìm thấy trang này</h1>
          <p className="lede">Đường dẫn có thể đã đổi. <Link href="/">Về trang Tổng quan</Link>.</p>
        </header>
      </main>
    </div>
  );
}

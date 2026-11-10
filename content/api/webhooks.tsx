import { Code } from "@/components/Code";
import { AnimFlow, ProsCons } from "@/components/AnimFlow";

export default function WebhooksPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục Webhooks">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#wh-overview"><span>01</span>Webhooks là gì</a></li>
          <li><a href="#wh-flow"><span>02</span>Luồng sự kiện</a></li>
          <li><a href="#wh-code"><span>03</span>Ký và kiểm chữ ký</a></li>
          <li><a href="#wh-pros"><span>04</span>Ưu và nhược</a></li>
          <li><a href="#wh-ops"><span>05</span>Cách làm cho đúng</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">webhooks · ghi chú học tập</div>
          <h1>Webhooks: server gọi ngược lại khi có sự kiện</h1>
          <p className="lede">Thay vì client hỏi liên tục “xong chưa?” (polling), bạn đăng ký một URL. Khi job chạy lâu (ví dụ tác vụ AI) hoàn tất, bên kia <b>POST</b> kết quả về URL đó: một callback HTTP đảo chiều.</p>
          <div className="tape" aria-hidden="true">
            <div>POST</div>
            <div className="hw">callback</div>
            <div>HMAC</div>
            <div>retry</div>
          </div>
        </header>
        <section id="wh-overview">
          <h2><span className="n">01</span>Webhooks là gì</h2>
          <ul className="plain">
            <li><b>Reverse HTTP callback</b>: nhà cung cấp dịch vụ là bên gọi, bạn là bên nhận.</li>
            <li><b>Không polling</b>: tiết kiệm request, nhận kết quả đúng lúc.</li>
            <li>Hợp với job chạy lâu, thanh toán, thông báo build/deploy.</li>
          </ul>
        </section>
        <section id="wh-flow">
          <h2><span className="n">02</span>Luồng sự kiện (chạy động)</h2>
          <AnimFlow
            label="5 bước của một webhook"
            steps={[
              { title: "Async job starts", sub: "tác vụ AI bắt đầu" },
              { title: "Event triggers", sub: "job xong, sinh sự kiện" },
              { title: "Server POSTs payload", sub: "gửi JSON tới URL của bạn" },
              { title: "Signature verification", sub: "kiểm HMAC chữ ký" },
              { title: "Worker processes", sub: "đẩy vào queue xử lý" },
            ]}
            caption="Trả 2xx thật nhanh sau bước 4, việc nặng để worker làm ở bước 5."
          />
        </section>
        <section id="wh-code">
          <h2><span className="n">03</span>Ký và kiểm chữ ký</h2>
          <Code lang="ts">{`import { createHmac, timingSafeEqual } from "node:crypto";

// HMAC (Hash-based Message Authentication Code): chứng minh payload đến từ bên có secret
export function verify(rawBody: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected), b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b); // so sánh thời gian cố định
}`}</Code>
        </section>
        <section id="wh-pros">
          <h2><span className="n">04</span>Ưu và nhược</h2>
          <ProsCons
            prosTitle="Điểm mạnh"
            consTitle="Hạn chế"
            pros={["Loại bỏ polling", "Tách tác vụ AI chậm khỏi request", "Kiến trúc nhẹ"]}
            cons={["Sự kiện trùng lặp hoặc sai thứ tự", "Rủi ro bảo mật và replay", "Chỉ thông báo một chiều"]}
          />
        </section>
        <section id="wh-ops">
          <h2><span className="n">05</span>Cách làm cho đúng</h2>
          <ul className="plain">
            <li><b>Idempotent</b>: lưu event id, nhận lại cùng id thì bỏ qua.</li>
            <li>Kiểm chữ ký trên <b>raw body</b> và timestamp để chống replay.</li>
            <li>Bên gửi sẽ retry khi bạn trả lỗi hoặc timeout; đừng tin thứ tự, hãy so version/timestamp.</li>
            <li>Cần bảo đảm hơn thì kết hợp <b>queue</b>: webhook chỉ ghi vào queue rồi trả 200.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

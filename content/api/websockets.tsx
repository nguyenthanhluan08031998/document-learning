import { Code } from "@/components/Code";
import { AnimFlow, ProsCons } from "@/components/AnimFlow";

export default function WebSocketsPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục WebSockets">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#ws-overview"><span>01</span>WebSockets là gì</a></li>
          <li><a href="#ws-flow"><span>02</span>Luồng kết nối</a></li>
          <li><a href="#ws-code"><span>03</span>Code mẫu</a></li>
          <li><a href="#ws-pros"><span>04</span>Ưu và nhược</a></li>
          <li><a href="#ws-ops"><span>05</span>Vận hành thực tế</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">websockets · ghi chú học tập</div>
          <h1>WebSockets: kênh hai chiều thời gian thực</h1>
          <p className="lede">WebSocket mở <b>một kết nối TCP (Transmission Control Protocol) duy nhất</b> rồi giữ nó sống. Client và server đều chủ động gửi frame bất cứ lúc nào, không cần hỏi–đáp từng lần như REST.</p>
          <div className="tape" aria-hidden="true">
            <div>HTTP Upgrade</div>
            <div>101</div>
            <div className="hw">full duplex</div>
            <div>ping/pong</div>
          </div>
        </header>
        <section id="ws-overview">
          <h2><span className="n">01</span>WebSockets là gì</h2>
          <ul className="plain">
            <li><b>Kết nối bền vững</b>: bắt tay một lần, dùng lại cho mọi message.</li>
            <li><b>Hai chiều, độ trễ thấp</b>: server đẩy dữ liệu ngay khi có, không cần polling.</li>
            <li><b>Hợp với</b>: voice/live AI, chat, giá chứng khoán, cộng tác thời gian thực. URL dùng <code>ws://</code> hoặc <code>wss://</code> (WSS, WebSocket Secure, chạy trên TLS).</li>
          </ul>
        </section>
        <section id="ws-flow">
          <h2><span className="n">02</span>Luồng kết nối (chạy động)</h2>
          <AnimFlow
            label="5 bước của một kết nối WebSocket"
            steps={[
              { title: "HTTP handshake", sub: "GET + Upgrade: websocket" },
              { title: "101 Switching Protocols", sub: "server đồng ý nâng cấp" },
              { title: "Persistent open pipe", sub: "TCP giữ mở" },
              { title: "Continuous duplex frames", sub: "hai bên gửi tự do" },
              { title: "Instant state sync", sub: "UI cập nhật tức thì" },
            ]}
            caption="Mỗi bước sáng lên lần lượt rồi lặp lại: sau bước 2, giao thức không còn là HTTP request–response nữa."
          />
        </section>
        <section id="ws-code">
          <h2><span className="n">03</span>Code mẫu</h2>
          <Code lang="ts">{`// Client (trình duyệt)
const ws = new WebSocket("wss://api.example.com/live");
ws.onopen = () => ws.send(JSON.stringify({ type: "subscribe", topic: "orders" }));
ws.onmessage = (e) => console.log("server đẩy:", JSON.parse(e.data));
ws.onclose = () => setTimeout(connect, 1000); // tự kết nối lại, WebSocket không tự retry`}</Code>
        </section>
        <section id="ws-pros">
          <h2><span className="n">04</span>Ưu và nhược</h2>
          <ProsCons
            prosTitle="Điểm mạnh"
            consTitle="Hạn chế"
            pros={["Độ trễ message rất thấp", "Server đẩy dữ liệu thật sự hai chiều", "Lý tưởng cho voice và live AI"]}
            cons={["Stateful nên scale đau đầu (cần sticky session hoặc pub/sub)", "Không có retry/backpressure sẵn", "Firewall và proxy có thể cắt kết nối"]}
          />
        </section>
        <section id="ws-ops">
          <h2><span className="n">05</span>Vận hành thực tế</h2>
          <ul className="plain">
            <li>Gửi <b>ping/pong</b> định kỳ để phát hiện kết nối chết và giữ NAT/proxy không đóng.</li>
            <li>Client phải <b>reconnect với backoff</b> và đồng bộ lại trạng thái đã lỡ (gửi kèm last event id).</li>
            <li>Nhiều server: dùng Redis pub/sub hoặc broker để phát message tới đúng kết nối.</li>
            <li>Chỉ cần server → client một chiều thì <b>SSE</b> (Server-Sent Events) đơn giản hơn.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

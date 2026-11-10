import { Code } from "@/components/Code";
import { AnimFlow, ProsCons } from "@/components/AnimFlow";

export default function McpPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục MCP">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#mcp-overview"><span>01</span>MCP là gì</a></li>
          <li><a href="#mcp-flow"><span>02</span>Luồng một lần gọi tool</a></li>
          <li><a href="#mcp-code"><span>03</span>Thông điệp JSON-RPC</a></li>
          <li><a href="#mcp-pros"><span>04</span>Ưu và nhược</a></li>
          <li><a href="#mcp-pick"><span>05</span>Chọn nhanh 6 kiểu API</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">mcp · ghi chú học tập</div>
          <h1>MCP: chuẩn nối agent với công cụ và dữ liệu</h1>
          <p className="lede"><b>MCP (Model Context Protocol)</b> là giao thức mở để một ứng dụng AI (host) kết nối LLM (Large Language Model) với <b>tools</b>, <b>data</b> và <b>files</b> qua một giao diện thống nhất, thay vì viết tích hợp riêng cho từng cặp model–dịch vụ.</p>
          <div className="tape" aria-hidden="true">
            <div>JSON-RPC 2.0</div>
            <div className="hw">stdio</div>
            <div>Streamable HTTP</div>
            <div>tools/call</div>
          </div>
        </header>
        <section id="mcp-overview">
          <h2><span className="n">01</span>MCP là gì</h2>
          <ul className="plain">
            <li><b>Host</b> (app AI) chứa các <b>client</b>, mỗi client nối tới một <b>MCP server</b>.</li>
            <li>Server công bố <b>tools</b> (hành động), <b>resources</b> (dữ liệu, file) và <b>prompts</b>.</li>
            <li>Vận chuyển: <b>stdio</b> (process cục bộ) hoặc <b>Streamable HTTP</b> (từ xa). Thông điệp là JSON-RPC 2.0.</li>
            <li>Khác REST: tool được <b>khám phá động</b> lúc chạy, LLM tự chọn tool phù hợp.</li>
          </ul>
        </section>
        <section id="mcp-flow">
          <h2><span className="n">02</span>Luồng một lần gọi tool (chạy động)</h2>
          <AnimFlow
            label="5 bước của MCP"
            steps={[
              { title: "Host connects MCP server", sub: "initialize, thỏa thuận" },
              { title: "tools/list discovery", sub: "lấy danh sách tool" },
              { title: "LLM selects tool", sub: "chọn tool và tham số" },
              { title: "JSON-RPC tools/call", sub: "client gửi lời gọi" },
              { title: "Structured context return", sub: "kết quả vào ngữ cảnh" },
            ]}
            caption="Bước 3 do model quyết định; bước 4–5 lặp lại cho tới khi agent đủ thông tin để trả lời."
          />
        </section>
        <section id="mcp-code">
          <h2><span className="n">03</span>Thông điệp JSON-RPC</h2>
          <Code lang="json">{`{ "jsonrpc": "2.0", "id": 7, "method": "tools/call",
  "params": { "name": "search_orders", "arguments": { "status": "PAID" } } }`}</Code>
          <Code lang="json">{`{ "jsonrpc": "2.0", "id": 7,
  "result": { "content": [{ "type": "text", "text": "12 đơn PAID" }] } }`}</Code>
          <p>Khối trên là client gọi tool, khối dưới là server trả kết quả (cùng <code>id</code>).</p>
        </section>
        <section id="mcp-pros">
          <h2><span className="n">04</span>Ưu và nhược</h2>
          <ProsCons
            prosTitle="Điểm mạnh"
            consTitle="Hạn chế"
            pros={["Giao diện tool thống nhất cho AI", "Cắm vào là chạy (plug and play)", "Tách model khỏi từng API cụ thể"]}
            cons={["Danh sách tool phình to làm đầy context window", "Spec thay đổi nhanh, có breaking change", "Thiết lập OAuth 2.1 phức tạp"]}
          />
          <div className="note">Tool từ server khác là dữ liệu không tin cậy: mô tả tool và kết quả có thể chứa prompt injection. Cấp quyền tối thiểu và yêu cầu xác nhận với hành động nguy hiểm.</div>
        </section>
        <section id="mcp-pick">
          <h2><span className="n">05</span>Chọn nhanh 6 kiểu API</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Kiểu</th>
                  <th>Dùng khi</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>REST</b></td><td>API công khai, CRUD</td></tr>
                <tr><td><b>GraphQL</b></td><td>UI phức tạp, đồ thị dữ liệu</td></tr>
                <tr><td><b>gRPC</b></td><td>Microservice nội bộ</td></tr>
                <tr><td><b>WebSockets</b></td><td>Voice thời gian thực, đồng bộ trực tiếp</td></tr>
                <tr><td><b>Webhooks</b></td><td>Job batch bất đồng bộ báo hoàn tất</td></tr>
                <tr><td><b>MCP</b></td><td>Agent tự khám phá và gọi tool</td></tr>
              </tbody>
            </table>
          </div>
          <p>Chọn theo kích thước payload, tính năng cần, ngân sách độ trễ và mức tự chủ của agent.</p>
        </section>
      </main>
    </div>
  );
}

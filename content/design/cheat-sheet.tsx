import Link from "next/link";

export default function CheatSheetPage() {
  return (
    <div className="wrap single">
      <main>
        <header className="hero">
          <div className="eyebrow">design · tra nhanh</div>
          <h1>Gặp vấn đề này, nghĩ tới pattern nào</h1>
          <p className="lede">Bảng tra từ triệu chứng sang lời giải. Bấm tên pattern để nhảy tới phần chi tiết.</p>
        </header>
        <section>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Vấn đề gặp phải</th>
                  <th>Pattern</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Chỉ được có một đối tượng dùng chung</td>
                  <td><Link className="plink" href="/design/creational/#cr-singleton">Singleton</Link></td>
                </tr>
                <tr>
                  <td>Tạo đối tượng theo loại chọn lúc chạy</td>
                  <td><Link className="plink" href="/design/creational/#cr-factory-method">Factory Method</Link></td>
                </tr>
                <tr>
                  <td>Tạo cả bộ đối tượng đồng nhất</td>
                  <td><Link className="plink" href="/design/creational/#cr-abstract-factory">Abstract Factory</Link></td>
                </tr>
                <tr>
                  <td>Constructor quá nhiều tham số tùy chọn</td>
                  <td><Link className="plink" href="/design/creational/#cr-builder">Builder</Link></td>
                </tr>
                <tr>
                  <td>Thư viện ngoài có interface không khớp</td>
                  <td><Link className="plink" href="/design/structural/#st-adapter">Adapter</Link></td>
                </tr>
                <tr>
                  <td>Thêm log, cache, retry quanh một service</td>
                  <td><Link className="plink" href="/design/structural/#st-decorator">Decorator</Link></td>
                </tr>
                <tr>
                  <td>Một use case gọi nhiều subsystem</td>
                  <td><Link className="plink" href="/design/structural/#st-facade">Facade</Link></td>
                </tr>
                <tr>
                  <td>Kiểm soát truy cập, tải trễ</td>
                  <td><Link className="plink" href="/design/structural/#st-proxy">Proxy</Link></td>
                </tr>
                <tr>
                  <td>Dữ liệu dạng cây</td>
                  <td><Link className="plink" href="/design/structural/#st-composite">Composite</Link></td>
                </tr>
                <tr>
                  <td>Nhiều thuật toán thay thế nhau</td>
                  <td><Link className="plink" href="/design/behavioral/#bh-strategy">Strategy</Link></td>
                </tr>
                <tr>
                  <td>Nhiều nơi cần biết khi có thay đổi</td>
                  <td><Link className="plink" href="/design/behavioral/#bh-observer">Observer</Link></td>
                </tr>
                <tr>
                  <td>if/else theo trạng thái khắp nơi</td>
                  <td><Link className="plink" href="/design/behavioral/#bh-state">State</Link></td>
                </tr>
                <tr>
                  <td>Pipeline kiểm tra, middleware</td>
                  <td><Link className="plink" href="/design/behavioral/#bh-chain">Chain of Responsibility</Link></td>
                </tr>
                <tr>
                  <td>Undo, xếp hàng thao tác</td>
                  <td><Link className="plink" href="/design/behavioral/#bh-command">Command</Link></td>
                </tr>
                <tr>
                  <td>Cùng khung quy trình, khác vài bước</td>
                  <td><Link className="plink" href="/design/behavioral/#bh-template-method">Template Method</Link></td>
                </tr>
                <tr>
                  <td>Giao dịch qua nhiều service</td>
                  <td><Link className="plink" href="/design/microservice/#ms-saga">Saga</Link></td>
                </tr>
                <tr>
                  <td>Ai điều phối quy trình nhiều service</td>
                  <td><Link className="plink" href="/design/microservice/#ms-orch-choreo">Orchestration vs Choreography</Link></td>
                </tr>
                <tr>
                  <td>Nhiều worker cùng lấy việc từ một bảng</td>
                  <td><Link className="plink" href="/concurrency/db-lock/#lk-skip">SELECT … FOR UPDATE SKIP LOCKED</Link></td>
                </tr>
                <tr>
                  <td>Vừa ghi DB vừa gửi sự kiện</td>
                  <td><Link className="plink" href="/design/microservice/#ms-outbox">Transactional Outbox</Link></td>
                </tr>
                <tr>
                  <td>Message bị giao trùng</td>
                  <td><Link className="plink" href="/design/microservice/#ms-idempotent-consumer">Idempotent Consumer</Link></td>
                </tr>
                <tr>
                  <td>Service phụ thuộc chậm hoặc chết</td>
                  <td><Link className="plink" href="/design/microservice/#ms-circuit-breaker">Circuit Breaker + Retry</Link></td>
                </tr>
                <tr>
                  <td>Màn hình đọc phức tạp, chậm</td>
                  <td><Link className="plink" href="/design/microservice/#ms-cqrs">CQRS</Link></td>
                </tr>
                <tr>
                  <td>Cần lịch sử đầy đủ, kiểm toán</td>
                  <td><Link className="plink" href="/design/microservice/#ms-event-sourcing">Event Sourcing</Link></td>
                </tr>
                <tr>
                  <td>Tách dần monolith</td>
                  <td><Link className="plink" href="/design/microservice/#ms-strangler">Strangler Fig</Link></td>
                </tr>
                <tr>
                  <td>Nghiệp vụ dính chặt vào framework, khó test</td>
                  <td><Link className="plink" href="/design/clean-architecture/#ca-layers">Clean Architecture</Link></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2>Những cặp hay bị nhầm</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Cặp</th>
                  <th>Phân biệt</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Adapter vs Facade</td>
                  <td>Adapter đổi một interface sang interface khác; Facade tạo interface mới đơn giản hơn cho cả một nhóm.</td>
                </tr>
                <tr>
                  <td>Decorator vs Proxy</td>
                  <td>Decorator thêm hành vi, nhận đối tượng từ ngoài; Proxy kiểm soát truy cập, thường tự quản lý đối tượng thật.</td>
                </tr>
                <tr>
                  <td>Strategy vs State</td>
                  <td>Strategy do bên ngoài chọn; State tự chuyển đổi theo vòng đời đối tượng.</td>
                </tr>
                <tr>
                  <td>Factory Method vs Abstract Factory</td>
                  <td>Một sản phẩm so với một bộ sản phẩm đi cùng nhau.</td>
                </tr>
                <tr>
                  <td>Observer vs Mediator</td>
                  <td>Observer phát rộng cho ai quan tâm; Mediator điều phối có chủ đích giữa các thành phần.</td>
                </tr>
                <tr>
                  <td>Saga orchestration vs choreography</td>
                  <td>Có trung tâm điều khiển hay các service tự phản ứng theo sự kiện.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

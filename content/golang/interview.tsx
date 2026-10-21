import Link from "next/link";
import { Code } from "@/components/Code";
import { findPage } from "@/lib/notebook";

// Short answers to the most common senior Go questions: [question, answer, page]
const QA: [string, string, string][] = [
  ["G, M, P là gì?", "G là goroutine, M là OS thread, P là quyền chạy code Go kèm hàng đợi riêng. Số P = GOMAXPROCS.", "runtime"],
  ["Goroutine gọi syscall chặn thì sao?", "M kẹt cùng G; sysmon tách P sang M khác để chạy tiếp. I/O mạng thì đi qua netpoller, không kẹt M.", "runtime"],
  ["Work stealing là gì?", "P hết việc lấy một nửa hàng đợi của P khác chọn ngẫu nhiên.", "runtime"],
  ["hchan gồm những gì?", "buf (ring buffer), qcount, dataqsiz, sendx, recvx, sendq, recvq (hàng đợi sudog), closed, lock.", "concurrency"],
  ["Unbuffered khác buffered?", "Unbuffered: copy thẳng stack sang stack, hai bên phải gặp nhau. Buffered: ghi vào buf, chỉ chặn khi đầy/rỗng.", "concurrency"],
  ["Goroutine leak do đâu?", "Chặn mãi trên channel/lock: gửi không ai nhận, nhận không ai close, quên cancel context.", "concurrency"],
  ["Channel hay Mutex?", "Channel để chuyển dữ liệu, phát tín hiệu; Mutex để bảo vệ trạng thái dùng chung.", "concurrency"],
  ["GC của Go?", "Concurrent tri-color mark & sweep, write barrier, không chia thế hệ, không compact. 1.26: Green Tea.", "memory"],
  ["STW ở đâu?", "Hai lần ngắn: bật write barrier đầu chu kỳ và mark termination. Thường dưới 1 ms.", "memory"],
  ["Escape analysis?", "Compiler quyết stack hay heap; xem bằng -gcflags=-m. Trả &x là escape.", "memory"],
  ["GOGC, GOMEMLIMIT?", "GOGC: heap được tăng bao nhiêu % trước lần GC sau. GOMEMLIMIT: giới hạn mềm, gần chạm thì GC dày hơn.", "memory"],
  ["Truyền slice vào hàm?", "Copy header: sửa phần tử thì caller thấy, append thì không.", "data-structures"],
  ["Vì sao map không thread-safe?", "Không lock để nhanh cho trường hợp một goroutine; ghi đồng thời gây fatal error.", "data-structures"],
  ["eface, iface?", "eface (any): _type + data. iface: itab (kiểu + bảng method) + data.", "data-structures"],
  ["Cache stampede?", "singleflight gộp lời gọi cùng key trong process, TTL có jitter, lock ngắn khi nhiều instance.", "production"],
  ["CPU 100%, OOM?", "Metric → pprof CPU/heap/goroutine → so sánh profile → sửa gốc; GOMEMLIMIT để chặn tạm.", "production"],
];

export default function GoInterviewPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục phỏng vấn Go">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#gi-quick"><span>01</span>Trả lời nhanh</a></li>
          <li><a href="#gi-orm"><span>02</span>ORM hay SQL</a></li>
          <li><a href="#gi-http"><span>03</span>Framework HTTP</a></li>
          <li><a href="#gi-test"><span>04</span>Chiến lược test</a></li>
          <li><a href="#gi-legacy"><span>05</span>Refactor, nâng cấp</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · phỏng vấn senior</div>
          <h1>Phỏng vấn Senior Go: tra nhanh</h1>
          <p className="lede">Interviewer senior ít hỏi cú pháp; họ hỏi runtime chạy thế nào, hiệu năng, thiết kế hệ thống và cách xử lý sự cố. Trang này gom câu trả lời ngắn và dẫn sang trang chi tiết, cùng phần “senior mindset”: lý do đằng sau lựa chọn công nghệ.</p>
        </header>

        <section id="gi-quick">
          <h2><span className="n">01</span>Trả lời nhanh</h2>
          <div className="tbl">
            <table>
              <thead><tr><th>Câu hỏi</th><th>Ý chính</th><th>Chi tiết</th></tr></thead>
              <tbody>
                {QA.map(([q, a, p]) => (
                  <tr key={q}><td><b>{q}</b></td><td>{a}</td><td><Link className="plink" href={`/golang/${p}/`}>{findPage("golang", p)?.page.label}</Link></td></tr>
                ))}
                <tr><td><b>gRPC hay REST?</b></td><td>gRPC (HTTP/2 + Protobuf) giữa các service nội bộ: nhanh, có contract, streaming. REST + JSON cho client ngoài, trình duyệt, đối tác.</td><td><Link className="plink" href="/api/compare/">API</Link></td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="gi-orm">
          <h2><span className="n">02</span>ORM (GORM, Ent) hay SQL (sqlx, pgx, sqlc)</h2>
          <div className="tbl">
            <table>
              <thead><tr><th></th><th>GORM</th><th>Ent</th><th>sqlc / sqlx / pgx</th></tr></thead>
              <tbody>
                <tr><td><b>Cách viết</b></td><td>Chuỗi method, reflection lúc chạy</td><td>Định nghĩa schema bằng Go, sinh code có kiểu</td><td>Viết SQL thật; sqlc sinh hàm Go có kiểu từ file .sql</td></tr>
                <tr><td><b>Mạnh</b></td><td>CRUD nhanh, nhiều plugin</td><td>Kiểu an toàn, quan hệ đồ thị, migration</td><td>Thấy rõ query, tối ưu được index/CTE/lock, nhanh nhất</td></tr>
                <tr><td><b>Yếu</b></td><td>Query sinh ra khó đoán, N+1, lỗi phát hiện lúc chạy</td><td>Học thêm DSL, code sinh nhiều</td><td>Viết nhiều SQL hơn, query động phải tự ghép</td></tr>
              </tbody>
            </table>
          </div>
          <p>Câu trả lời senior: hệ thống thanh toán, tải cao cần kiểm soát transaction và lock (<code>SELECT ... FOR UPDATE</code>) nên ưu tiên <b>sqlc + pgx</b>; admin/CRUD nội bộ dùng ORM để đi nhanh. Quan trọng là lý do và việc team thống nhất, không phải công cụ.</p>
        </section>

        <section id="gi-http">
          <h2><span className="n">03</span>net/http, Gin, Echo hay Fiber</h2>
          <ul className="plain">
            <li><b>net/http</b>: từ 1.22 router chuẩn đã có method và path param (<code>GET /users/{"{id}"}</code>), đủ cho phần lớn API. Không phụ thuộc ngoài, middleware chỉ là <code>func(http.Handler) http.Handler</code>.</li>
            <li><b>Gin, Echo, Chi</b>: dựa trên net/http, thêm binding, validation, middleware có sẵn; Chi gần chuẩn nhất.</li>
            <li><b>Fiber</b>: dựa trên fasthttp, không tương thích <code>http.Handler</code>, không dùng chung middleware và hệ sinh thái chuẩn (OpenTelemetry, pprof handler). Nhanh trên benchmark nhưng hiếm khi HTTP layer là nút cổ chai.</li>
          </ul>
        </section>

        <section id="gi-test">
          <h2><span className="n">04</span>Chiến lược test</h2>
          <div className="cmp">
            <div><h4>Unit test + mock</h4>Mock interface nhỏ ở tầng service (gomock, testify/mock, hoặc tự viết fake). Nhanh, chạy mỗi lần lưu. Dễ mock quá tay: test pass nhưng SQL thật sai.</div>
            <div><h4>Integration + Testcontainers</h4>Dựng Postgres, Redis, Kafka thật bằng Docker trong test. Bắt được lỗi SQL, migration, transaction, lock. Chậm hơn, chạy trong CI.</div>
          </div>
          <Code lang="go">{`// Table-driven test + subtest chạy song song
func TestCalcFee(t *testing.T) {
    cases := []struct{ name string; amount, want int64 }{
        {"zero", 0, 0},
        {"normal", 10_000, 150},
    }
    for _, c := range cases {
        t.Run(c.name, func(t *testing.T) {
            t.Parallel()
            if got := CalcFee(c.amount); got != c.want {
                t.Fatalf("CalcFee(%d) = %d, want %d", c.amount, got, c.want)
            }
        })
    }
}
// go test -race -cover ./...   ·   testing/synctest (1.25) để test code có time, goroutine`}</Code>
        </section>

        <section id="gi-legacy">
          <h2><span className="n">05</span>Refactor code cũ và nâng phiên bản Go</h2>
          <ol className="steps">
            <li><div><b>Có test bao quanh trước</b><div className="d">Viết characterization test ghi lại hành vi hiện tại rồi mới sửa.</div></div></li>
            <li><div><b>Nâng go.mod từng bước</b><div className="d">Đọc release notes, chạy vet, test -race; giữ hành vi cũ bằng godebug nếu cần.</div></div></li>
            <li><div><b>Dùng công cụ</b><div className="d"><code>go fix ./...</code> (1.26+) tự đổi sang min/max, range int, slices, any...; <code>//go:fix inline</code> để chuyển lời gọi API cũ sang API mới.</div></div></li>
            <li><div><b>Hiện đại hoá có chọn lọc</b><div className="d">log → log/slog; tự viết router → ServeMux 1.22; hàm lặp lại cho nhiều kiểu → generics; nhiều module trong một repo → go.work. Không viết lại chỉ vì có cú pháp mới.</div></div></li>
          </ol>
          <p className="sub">Xem các mốc phiên bản ở trang <Link className="plink" href="/golang/versions/">Phiên bản</Link>.</p>
        </section>
      </main>
    </div>
  );
}

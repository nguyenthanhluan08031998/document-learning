import Link from "next/link";
import { Code } from "@/components/Code";

const MAIN = "var(--accent)";
const FEAT = "var(--warn)";

// Commit with its letter inside
const Commit = ({ x, y, label, c }: { x: number; y: number; label: string; c: string }) => (
  <g>
    <circle cx={x} cy={y} r="13" style={{ fill: "var(--surface)", stroke: c, strokeWidth: 2 }} />
    <text className="s-tm" x={x} y={y + 4} textAnchor="middle" style={{ fill: "var(--ink)" }}>{label}</text>
  </g>
);
const Line = ({ d, c }: { d: string; c: string }) => <path d={d} style={{ fill: "none", stroke: c, strokeWidth: 2 }} />;

export default function MergeRebasePage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục merge và rebase">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#mr-graph"><span>01</span>Bốn cách gộp</a></li>
          <li><a href="#mr-cmd"><span>02</span>Lệnh</a></li>
          <li><a href="#mr-compare"><span>03</span>So sánh</a></li>
          <li><a href="#mr-rule"><span>04</span>Quy tắc</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">git · merge vs rebase</div>
          <h1>Merge, Rebase, Squash, Cherry-pick</h1>
          <p className="lede">Cùng một việc là đưa commit từ nhánh này sang nhánh khác, nhưng mỗi cách để lại lịch sử khác nhau.</p>
          <div className="tape" aria-hidden="true">
            <div>merge</div>
            <div>rebase</div>
            <div>--squash</div>
            <div className="hw">cherry-pick</div>
            <div className="leo">--force-with-lease</div>
          </div>
        </header>

        <section id="mr-graph">
          <h2><span className="n">01</span>Bốn cách gộp</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 400" role="img" aria-label="Ban đầu feature tách từ B với D, E, main có thêm C. Merge tạo commit M nối hai nhánh. Rebase chép D, E thành D', E' sau C. Squash gộp D, E thành một commit S. Cherry-pick chép riêng E thành E' lên main">
                <text className="s-tb" x="16" y="44">Ban đầu</text>
                <Line d="M150 40 H300" c={MAIN} />
                <Line d="M240 40 C260 40 260 80 280 80 H350" c={FEAT} />
                <Commit x={180} y={40} label="A" c={MAIN} /><Commit x={240} y={40} label="B" c={MAIN} /><Commit x={300} y={40} label="C" c={MAIN} />
                <Commit x={300} y={80} label="D" c={FEAT} /><Commit x={360} y={80} label="E" c={FEAT} />
                <text className="s-tm" x="500" y="44">feature tách từ B; main đã có thêm C</text>

                <text className="s-tb" x="16" y="124">merge</text>
                <Line d="M150 120 H420" c={MAIN} />
                <Line d="M240 120 C260 120 260 160 280 160 H360 C390 160 390 120 420 120" c={FEAT} />
                <Commit x={180} y={120} label="A" c={MAIN} /><Commit x={240} y={120} label="B" c={MAIN} /><Commit x={300} y={120} label="C" c={MAIN} />
                <Commit x={300} y={160} label="D" c={FEAT} /><Commit x={360} y={160} label="E" c={FEAT} />
                <Commit x={420} y={120} label="M" c={MAIN} />
                <text className="s-tm" x="500" y="124">giữ nguyên D, E; thêm merge commit M có hai cha</text>

                <text className="s-tb" x="16" y="214">rebase</text>
                <Line d="M150 210 H420" c={MAIN} />
                <Commit x={180} y={210} label="A" c={MAIN} /><Commit x={240} y={210} label="B" c={MAIN} /><Commit x={300} y={210} label="C" c={MAIN} />
                <Commit x={360} y={210} label="D'" c={FEAT} /><Commit x={420} y={210} label="E'" c={FEAT} />
                <text className="s-tm" x="500" y="214">chép D, E sau C thành commit mới; lịch sử thẳng</text>

                <text className="s-tb" x="16" y="284">squash</text>
                <Line d="M150 280 H360" c={MAIN} />
                <Commit x={180} y={280} label="A" c={MAIN} /><Commit x={240} y={280} label="B" c={MAIN} /><Commit x={300} y={280} label="C" c={MAIN} />
                <Commit x={360} y={280} label="S" c={FEAT} />
                <text className="s-tm" x="500" y="284">gộp D + E thành một commit S trên main</text>

                <text className="s-tb" x="16" y="354">cherry-pick</text>
                <Line d="M150 350 H360" c={MAIN} />
                <Commit x={180} y={350} label="A" c={MAIN} /><Commit x={240} y={350} label="B" c={MAIN} /><Commit x={300} y={350} label="C" c={MAIN} />
                <Commit x={360} y={350} label="E'" c={FEAT} />
                <text className="s-tm" x="500" y="354">chỉ chép riêng E sang main; D ở lại feature</text>
              </svg>
            </div>
            <figcaption>Xanh là commit của <code>main</code>, cam là commit đến từ <code>feature</code>. Dấu nháy (D', E') là bản chép: nội dung giống nhưng hash khác.</figcaption>
          </figure>
        </section>

        <section id="mr-cmd">
          <h2><span className="n">02</span>Lệnh</h2>
          <Code lang="bash">{`# merge: gộp feature vào main, tạo merge commit
git switch main
git merge feature            # --no-ff: luôn tạo merge commit; --ff-only: chỉ fast-forward

# rebase: đưa feature lên đầu main mới nhất
git switch feature
git rebase main              # có xung đột: sửa, git add, git rebase --continue (hoặc --abort)
git rebase -i main           # dọn commit: gộp (squash), sửa message, xoá, đổi thứ tự
git push --force-with-lease  # nhánh đã push trước đó cần push đè sau khi rebase

# squash merge: cả nhánh thành một commit
git switch main
git merge --squash feature && git commit -m "feat: checkout v2"

# cherry-pick: chép một commit cụ thể
git switch release/1.4
git cherry-pick 3f2a9c1

# pull bằng rebase thay vì tạo merge commit
git config --global pull.rebase true`}</Code>
        </section>

        <section id="mr-compare">
          <h2><span className="n">03</span>So sánh</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Cách</th>
                  <th>Lịch sử</th>
                  <th>Đổi hash</th>
                  <th>Xung đột</th>
                  <th>Dùng khi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>merge</b></td>
                  <td>Giữ nguyên, có merge commit, dạng cây</td>
                  <td>Không</td>
                  <td>Giải quyết một lần</td>
                  <td>Gộp nhánh dùng chung (release → main); cần giữ đúng dấu vết</td>
                </tr>
                <tr>
                  <td><b>rebase</b></td>
                  <td>Thẳng, không có merge commit</td>
                  <td>Có</td>
                  <td>Có thể phải giải quyết ở từng commit</td>
                  <td>Cập nhật nhánh feature của mình theo main; dọn commit trước khi mở PR</td>
                </tr>
                <tr>
                  <td><b>squash</b></td>
                  <td>Một commit cho cả nhánh</td>
                  <td>Có</td>
                  <td>Giải quyết một lần</td>
                  <td>PR nhỏ, muốn main gọn; chấp nhận mất chi tiết từng commit</td>
                </tr>
                <tr>
                  <td><b>cherry-pick</b></td>
                  <td>Chép một vài commit lẻ</td>
                  <td>Có</td>
                  <td>Theo từng commit</td>
                  <td>Đưa một bản sửa lỗi sang nhánh release hoặc hotfix</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="mr-rule">
          <h2><span className="n">04</span>Quy tắc</h2>
          <ul className="plain">
            <li><b>Không rebase commit đã nằm trên nhánh người khác dùng chung</b> (main, develop). Rebase tạo hash mới, người khác sẽ bị lệch lịch sử.</li>
            <li>Rebase nhánh của riêng mình thì thoải mái. Push lại bằng <code>--force-with-lease</code>: nó từ chối nếu trên remote có commit mới mà bạn chưa thấy, an toàn hơn <code>--force</code>.</li>
            <li>Cách phổ biến: rebase feature theo main trong lúc làm, rồi merge (hoặc squash merge) qua pull request.</li>
            <li>Lỡ tay thì xem <code>git reflog</code> để tìm lại commit cũ.</li>
          </ul>
          <div className="note tip">Chọn cách gộp đi đôi với mô hình nhánh, xem <Link className="plink" href="/git/workflow/">Branching workflow</Link>. Trunk-based thường dùng rebase và squash để giữ trunk thẳng.</div>
        </section>
      </main>
    </div>
  );
}

import Link from "next/link";

const C = { main: "var(--accent)", dev: "var(--new)", feat: "var(--warn)", rel: "var(--ok)", fix: "var(--bad)" };
const ENV_TEST = "var(--deploy)";

// Commit dot on a branch line
const Dot = ({ x, y, c }: { x: number; y: number; c: string }) =>
  <circle cx={x} cy={y} r="6" style={{ fill: "var(--surface)", stroke: c, strokeWidth: 2.5 }} />;
const Line = ({ d, c, dash }: { d: string; c: string; dash?: boolean }) =>
  <path d={d} style={{ fill: "none", stroke: c, strokeWidth: 2, strokeDasharray: dash ? "5 4" : undefined }} />;

export default function GitWorkflowPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục branching workflow">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#gw-gitflow"><span>01</span>Git Flow</a></li>
          <li><a href="#gw-github"><span>02</span>GitHub Flow</a></li>
          <li><a href="#gw-gitlab"><span>03</span>GitLab Flow</a></li>
          <li><a href="#gw-trunk"><span>04</span>Trunk-based</a></li>
          <li><a href="#gw-envs"><span>05</span>Ví dụ 4 môi trường</a></li>
          <li><a href="#gw-compare"><span>06</span>So sánh</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">git · branching workflow</div>
          <h1>Các mô hình chia nhánh</h1>
          <p className="lede">Quy ước team dùng nhánh nào, sống bao lâu, merge vào đâu và release thế nào. Bốn mô hình phổ biến, từ nhiều nhánh nhất đến ít nhánh nhất.</p>
          <div className="tape" aria-hidden="true">
            <div>main</div>
            <div>develop</div>
            <div>feature/*</div>
            <div className="hw">trunk</div>
            <div className="leo">feature flag</div>
          </div>
        </header>

        <section id="gw-gitflow">
          <h2><span className="n">01</span>Git Flow</h2>
          <p>Hai nhánh sống lâu: <code>main</code> chỉ chứa bản đã release, <code>develop</code> gom tính năng cho bản kế tiếp. Ba loại nhánh tạm: <code>feature/*</code>, <code>release/*</code>, <code>hotfix/*</code>.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 250" role="img" aria-label="Git Flow: feature tách từ develop rồi merge lại develop; release tách từ develop, merge vào main và develop; hotfix tách từ main, merge vào main và develop">
                <text className="s-tm" x="16" y="44" style={{ fill: C.main }}>main</text>
                <text className="s-tm" x="16" y="89" style={{ fill: C.fix }}>hotfix/*</text>
                <text className="s-tm" x="16" y="134" style={{ fill: C.rel }}>release/*</text>
                <text className="s-tm" x="16" y="179" style={{ fill: C.dev }}>develop</text>
                <text className="s-tm" x="16" y="224" style={{ fill: C.feat }}>feature/*</text>
                <Line d="M120 40 H880" c={C.main} />
                <Line d="M120 175 H880" c={C.dev} />
                <Line d="M260 175 C280 175 280 220 300 220 H340 C360 220 360 175 380 175" c={C.feat} />
                <Line d="M480 175 C490 175 490 130 500 130 H530 C545 130 545 40 560 40" c={C.rel} />
                <Line d="M530 130 C565 130 565 175 600 175" c={C.rel} dash />
                <Line d="M560 40 C620 40 620 85 680 85 C700 85 700 40 720 40" c={C.fix} />
                <Line d="M680 85 C720 85 720 175 760 175" c={C.fix} dash />
                {[140, 560, 720].map(x => <Dot key={x} x={x} y={40} c={C.main} />)}
                {[160, 260, 380, 480, 600, 760, 840].map(x => <Dot key={x} x={x} y={175} c={C.dev} />)}
                {[300, 340].map(x => <Dot key={x} x={x} y={220} c={C.feat} />)}
                {[500, 530].map(x => <Dot key={x} x={x} y={130} c={C.rel} />)}
                <Dot x={680} y={85} c={C.fix} />
                <text className="s-tm" x="140" y="24" textAnchor="middle">v1.0</text>
                <text className="s-tm" x="560" y="24" textAnchor="middle">v1.1</text>
                <text className="s-tm" x="720" y="24" textAnchor="middle">v1.1.1</text>
              </svg>
            </div>
            <figcaption>Release và hotfix được merge vào cả <code>main</code> lẫn <code>develop</code> (nét đứt) để hai nhánh không lệch nhau.</figcaption>
          </figure>
        </section>

        <section id="gw-github">
          <h2><span className="n">02</span>GitHub Flow</h2>
          <p>Chỉ một nhánh sống lâu là <code>main</code>, luôn deploy được. Mỗi việc là một nhánh ngắn, mở pull request, review xong thì merge và deploy ngay.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 140" role="img" aria-label="GitHub Flow: các nhánh ngắn tách từ main, mở pull request, merge lại main và deploy">
                <text className="s-tm" x="16" y="44" style={{ fill: C.main }}>main</text>
                <text className="s-tm" x="16" y="104" style={{ fill: C.feat }}>feature/*</text>
                <Line d="M120 40 H880" c={C.main} />
                <Line d="M180 40 C200 40 200 100 220 100 H320 C340 100 340 40 360 40" c={C.feat} />
                <Line d="M480 40 C500 40 500 100 520 100 H620 C640 100 640 40 660 40" c={C.feat} />
                {[140, 180, 360, 480, 660, 820].map(x => <Dot key={x} x={x} y={40} c={C.main} />)}
                {[220, 270, 320, 520, 570, 620].map(x => <Dot key={x} x={x} y={100} c={C.feat} />)}
                <text className="s-tm" x="270" y="126" textAnchor="middle">PR #12</text>
                <text className="s-tm" x="570" y="126" textAnchor="middle">PR #13</text>
                <text className="s-tm" x="360" y="24" textAnchor="middle" style={{ fill: C.rel }}>deploy</text>
                <text className="s-tm" x="660" y="24" textAnchor="middle" style={{ fill: C.rel }}>deploy</text>
              </svg>
            </div>
          </figure>
        </section>

        <section id="gw-gitlab">
          <h2><span className="n">03</span>GitLab Flow</h2>
          <p>GitHub Flow thêm <b>nhánh môi trường</b>: code merge vào <code>main</code>, rồi được đẩy dần sang <code>staging</code> và <code>production</code> bằng merge. Biến thể khác dùng nhánh <code>release/1.x</code> cho app cần giữ nhiều phiên bản.</p>
          <ul className="plain">
            <li>Hợp khi cần nhiều môi trường và kiểm soát lúc nào code lên production.</li>
            <li>Sửa lỗi luôn vào <code>main</code> trước, rồi đưa xuống nhánh dưới (upstream first).</li>
          </ul>
        </section>

        <section id="gw-trunk">
          <h2><span className="n">04</span>Trunk-based development</h2>
          <p>Mọi người commit vào một nhánh chung (<b>trunk</b>, thường là <code>main</code>) ít nhất mỗi ngày. Nhánh riêng nếu có thì sống dưới một ngày. Tính năng chưa xong được ẩn bằng <b>feature flag</b> thay vì giữ trên nhánh.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 150" role="img" aria-label="Trunk-based: commit nhỏ liên tục vào trunk, nhánh ngắn dưới một ngày, release cắt từ trunk">
                <text className="s-tm" x="16" y="74" style={{ fill: C.main }}>trunk</text>
                <text className="s-tm" x="16" y="124" style={{ fill: C.feat }}>{"nhánh < 1 ngày"}</text>
                <text className="s-tm" x="16" y="24" style={{ fill: C.rel }}>release</text>
                <Line d="M120 70 H880" c={C.main} />
                <Line d="M240 70 C255 70 255 120 270 120 C285 120 285 70 300 70" c={C.feat} />
                <Line d="M480 70 C495 70 495 120 510 120 C525 120 525 70 540 70" c={C.feat} />
                <Line d="M660 70 C680 70 680 20 700 20 H800" c={C.rel} />
                {[140, 190, 240, 300, 360, 420, 480, 540, 600, 660, 720, 780, 840].map(x => <Dot key={x} x={x} y={70} c={C.main} />)}
                <Dot x={270} y={120} c={C.feat} />
                <Dot x={510} y={120} c={C.feat} />
                <Dot x={760} y={20} c={C.rel} />
                <text className="s-tm" x="815" y="24">cherry-pick fix</text>
              </svg>
            </div>
            <figcaption>Trunk luôn xanh nhờ CI chạy mỗi commit. Nhánh release (nếu có) cắt từ trunk và chỉ nhận cherry-pick sửa lỗi.</figcaption>
          </figure>
          <div className="note tip">Cách làm của Google, Meta và nhiều team deploy nhiều lần mỗi ngày. Điều kiện: test tự động tốt, review nhanh, có feature flag.</div>
        </section>

        <section id="gw-envs">
          <h2><span className="n">05</span>Ví dụ: 4 môi trường dev, test, uat, prod</h2>
          <p>Môi trường không nhất thiết phải là nhánh. Có hai cách tổ chức thường gặp.</p>

          <h3>Cách 1: mỗi môi trường một nhánh</h3>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 236" role="img" aria-label="Mỗi môi trường một nhánh: feature merge vào develop deploy DEV, develop merge lên test deploy TEST, test merge lên uat deploy UAT, uat merge lên main deploy PROD; hotfix từ main merge ngược xuống uat, test, develop">
                <text className="s-tm" x="16" y="44" style={{ fill: C.main }}>main → PROD</text>
                <text className="s-tm" x="16" y="84" style={{ fill: C.rel }}>uat → UAT</text>
                <text className="s-tm" x="16" y="124" style={{ fill: ENV_TEST }}>test → TEST</text>
                <text className="s-tm" x="16" y="164" style={{ fill: C.dev }}>develop → DEV</text>
                <text className="s-tm" x="16" y="204" style={{ fill: C.feat }}>feature/*</text>
                <Line d="M130 40 H880" c={C.main} />
                <Line d="M130 80 H880" c={C.rel} />
                <Line d="M130 120 H880" c={ENV_TEST} />
                <Line d="M130 160 H880" c={C.dev} />
                <Line d="M160 160 C175 160 175 200 190 200 H230 C245 200 245 160 260 160" c={C.feat} />
                <Line d="M300 160 C320 160 320 120 340 120" c={C.dev} />
                <Line d="M400 120 C420 120 420 80 440 80" c={ENV_TEST} />
                <Line d="M500 80 C520 80 520 40 540 40" c={C.rel} />
                <Line d="M640 40 C660 40 660 80 680 80" c={C.fix} dash />
                <Line d="M680 80 C700 80 700 120 720 120" c={C.fix} dash />
                <Line d="M720 120 C740 120 740 160 760 160" c={C.fix} dash />
                {[540, 640].map(x => <Dot key={x} x={x} y={40} c={C.main} />)}
                {[440, 680].map(x => <Dot key={x} x={x} y={80} c={C.rel} />)}
                {[340, 720].map(x => <Dot key={x} x={x} y={120} c={ENV_TEST} />)}
                {[160, 260, 300, 760].map(x => <Dot key={x} x={x} y={160} c={C.dev} />)}
                {[190, 230].map(x => <Dot key={x} x={x} y={200} c={C.feat} />)}
                <text className="s-tm" x="420" y="226" textAnchor="middle">merge lên từng bậc</text>
                <text className="s-tm" x="700" y="226" textAnchor="middle" style={{ fill: C.fix }}>hotfix: merge ngược xuống</text>
              </svg>
            </div>
          </figure>
          <ul className="plain">
            <li>Push vào nhánh nào thì CI/CD deploy lên môi trường đó. Code chỉ đi một chiều: <code>develop</code> → <code>test</code> → <code>uat</code> → <code>main</code>.</li>
            <li>Lỗi gấp trên prod: tạo <code>hotfix/*</code> từ <code>main</code>, merge vào <code>main</code>, rồi merge ngược về <code>uat</code>, <code>test</code>, <code>develop</code>.</li>
            <li><b>Nhược:</b> bốn nhánh dễ lệch nhau, và mỗi môi trường build lại nên bản chạy trên prod không phải đúng bản đã test ở UAT.</li>
          </ul>

          <h3>Cách 2: một nhánh, đẩy cùng một bản build qua các môi trường</h3>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 230" role="img" aria-label="Một nhánh main: merge PR vào main, build một lần ra image v1.4.0, đẩy image đó tự động lên DEV rồi TEST, sau đó bấm duyệt để lên UAT và PROD">
                <defs>
                  <marker id="gwa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker>
                </defs>
                <text className="s-tm" x="16" y="34" style={{ fill: C.main }}>main</text>
                <text className="s-tm" x="16" y="74" style={{ fill: C.feat }}>feature/*</text>
                <Line d="M130 30 H880" c={C.main} />
                <Line d="M160 30 C175 30 175 70 190 70 H230 C245 70 245 30 260 30" c={C.feat} />
                {[160, 260, 760].map(x => <Dot key={x} x={x} y={30} c={C.main} />)}
                {[190, 230].map(x => <Dot key={x} x={x} y={70} c={C.feat} />)}
                <rect className="s-disk" x="330" y="56" width="240" height="44" rx="7" />
                <text className="s-tb" x="342" y="77">Build 1 lần</text>
                <text className="s-tm" x="342" y="93">image order-svc:v1.4.0</text>
                <path className="s-dl" d="M262 36 C290 60 300 78 328 78" markerEnd="url(#gwa)" />
                {[["DEV", "tự động", 130], ["TEST", "tự động", 330], ["UAT", "bấm duyệt", 530], ["PROD", "bấm duyệt", 730]].map(([env, how, x]) => (
                  <g key={env}>
                    <rect className={env === "PROD" ? "s-hl" : "s-box"} x={x} y="150" width="140" height="48" rx="7" />
                    <text className="s-tb" x={Number(x) + 12} y="172">{env}</text>
                    <text className="s-tm" x={Number(x) + 12} y="189">v1.4.0 · {how}</text>
                  </g>
                ))}
                <path className="s-dl" d="M330 86 C250 86 200 110 200 148" markerEnd="url(#gwa)" />
                <path className="s-ln" d="M270 174 H328" markerEnd="url(#gwa)" style={{ stroke: "var(--muted)" }} />
                <path className="s-ln" d="M470 174 H528" markerEnd="url(#gwa)" style={{ stroke: "var(--muted)" }} />
                <path className="s-ln" d="M670 174 H728" markerEnd="url(#gwa)" style={{ stroke: "var(--muted)" }} />
              </svg>
            </div>
          </figure>
          <ul className="plain">
            <li>Chỉ có <code>main</code> và các nhánh feature. Mỗi lần merge vào <code>main</code>, CI <b>build một lần</b> ra image hoặc tag, ví dụ <code>v1.4.0</code>.</li>
            <li>Bản build đó được đẩy dần dev → test → uat → prod. Lên UAT và prod cần người bấm duyệt (GitHub Environments, GitLab manual job).</li>
            <li>Thứ chạy trên prod chính là thứ đã test ở UAT. Tính năng chưa xong thì ẩn bằng feature flag.</li>
          </ul>
          <div className="note tip"><b>Nên chọn:</b> team mới, CI/CD đơn giản → cách 1 cho dễ hiểu. Đã build Docker image → cách 2, đây là cách hầu hết team lớn dùng.</div>
        </section>

        <section id="gw-compare">
          <h2><span className="n">06</span>So sánh</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Mô hình</th>
                  <th>Nhánh sống lâu</th>
                  <th>Release</th>
                  <th>Hợp với</th>
                  <th>Nhược điểm</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Git Flow</b></td>
                  <td><code>main</code>, <code>develop</code></td>
                  <td>Theo phiên bản, qua <code>release/*</code></td>
                  <td>Mobile, desktop, thư viện: release theo đợt, giữ nhiều phiên bản</td>
                  <td>Nhiều nhánh, merge phức tạp, tích hợp chậm</td>
                </tr>
                <tr>
                  <td><b>GitHub Flow</b></td>
                  <td><code>main</code></td>
                  <td>Deploy ngay sau khi merge PR</td>
                  <td>Web, SaaS, team nhỏ và vừa</td>
                  <td>Khó giữ nhiều phiên bản song song</td>
                </tr>
                <tr>
                  <td><b>GitLab Flow</b></td>
                  <td><code>main</code> + nhánh môi trường</td>
                  <td>Merge dần sang <code>staging</code>, <code>production</code></td>
                  <td>Cần nhiều môi trường, lên production có kiểm soát</td>
                  <td>Thêm nhánh, dễ lệch giữa các môi trường</td>
                </tr>
                <tr>
                  <td><b>Trunk-based</b></td>
                  <td><code>main</code> (trunk)</td>
                  <td>Liên tục từ trunk, bật tắt bằng feature flag</td>
                  <td>Team có CI/CD mạnh, deploy nhiều lần mỗi ngày</td>
                  <td>Cần kỷ luật, test tự động tốt, quản lý flag</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Chọn nhanh:</b> web deploy liên tục → GitHub Flow hoặc Trunk-based. App có số phiên bản và release theo đợt → Git Flow. Cần staging, production tách bạch → GitLab Flow. Cách gộp nhánh xem ở <Link className="plink" href="/git/merge-rebase/">Merge vs Rebase</Link>.</div>
        </section>
      </main>
    </div>
  );
}

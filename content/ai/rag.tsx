import { Code } from "@/components/Code";

// Arrowhead markers; ids are prefixed per diagram so the two SVGs on the page do not clash
const Markers = ({ id }: { id: string }) => (
  <defs>
    {[["a", "var(--accent)"], ["b", "var(--bad)"], ["c", "var(--ok)"]].map(([k, c]) => (
      <marker key={k} id={`${id}${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill={c} />
      </marker>
    ))}
  </defs>
);

const Box = ({ x, y, w, h = 50, title, sub, cls = "s-box" }: { x: number; y: number; w: number; h?: number; title: string; sub?: string; cls?: string }) => (
  <g>
    <rect className={cls} x={x} y={y} width={w} height={h} rx="7" />
    <text className="s-tb" x={x + w / 2} y={sub ? y + h / 2 - 2 : y + h / 2 + 5} textAnchor="middle">{title}</text>
    {sub && <text className="s-tm" x={x + w / 2} y={y + h / 2 + 15} textAnchor="middle">{sub}</text>}
  </g>
);

export default function RagPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục RAG">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#rag-what"><span>01</span>RAG là gì</a></li>
          <li><a href="#rag-classic"><span>02</span>RAG</a></li>
          <li><a href="#rag-agentic"><span>03</span>Agentic RAG</a></li>
          <li><a href="#rag-compare"><span>04</span>So sánh</a></li>
          <li><a href="#rag-code"><span>05</span>Phác thảo code</a></li>
          <li><a href="#rag-when"><span>06</span>Khi nào dùng</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">ai · rag vs agentic rag</div>
          <h1>RAG và Agentic RAG</h1>
          <p className="lede">Cả hai đều lấy dữ liệu bên ngoài nhét vào prompt để LLM trả lời đúng hơn. Khác nhau ở chỗ RAG tìm <b>một lần</b> theo đường cố định, còn Agentic RAG để một agent <b>tự chọn công cụ, tự kiểm tra</b> và tìm lại cho tới khi đủ bằng chứng.</p>
          <div className="tape" aria-hidden="true">
            <div>embedding</div>
            <div>vector index</div>
            <div>top-K</div>
            <div className="hw">agent loop</div>
            <div>evaluator</div>
            <div>MCP</div>
          </div>
        </header>

        <section id="rag-what">
          <h2><span className="n">01</span>RAG là gì</h2>
          <p><b>RAG (Retrieval-Augmented Generation)</b> là kỹ thuật cho LLM <b>tra cứu trước, trả lời sau</b>: trước khi sinh câu trả lời, hệ thống tìm các đoạn tài liệu liên quan tới câu hỏi trong kho dữ liệu của mình, rồi đưa chúng vào prompt làm ngữ cảnh. LLM trả lời dựa trên ngữ cảnh đó thay vì chỉ dựa vào những gì nó đã học lúc train.</p>
          <p>Tên gọi nói đúng ba phần: <b>Retrieval</b> (tìm dữ liệu), <b>Augmented</b> (bổ sung dữ liệu đó vào prompt), <b>Generation</b> (LLM sinh câu trả lời).</p>

          <h3>Vì sao cần RAG</h3>
          <div className="cmp">
            <div><h4>LLM một mình</h4>Chỉ biết dữ liệu tới thời điểm train, không biết tài liệu nội bộ hay dữ liệu mới. Khi không biết vẫn có thể bịa ra câu trả lời nghe rất hợp lý (hallucination), và không chỉ ra được nguồn.</div>
            <div><h4>LLM + RAG</h4>Trả lời theo dữ liệu thật, mới nhất, kể cả dữ liệu riêng của công ty. Có thể trích nguồn. Cập nhật kiến thức chỉ cần nạp lại tài liệu, không phải train lại model.</div>
          </div>
          <div className="note tip">RAG khác fine-tune: fine-tune dạy model một <b>cách làm</b> (giọng văn, định dạng, kỹ năng) bằng cách train lại; RAG đưa cho model <b>dữ kiện</b> lúc hỏi. Kiến thức hay thay đổi thì dùng RAG.</div>

          <h3>Hai giai đoạn</h3>
          <ol className="steps">
            <li><div><b>Nạp dữ liệu (indexing, chạy trước)</b><div className="d">Đọc tài liệu (PDF, docs, code, trang web), cắt thành các đoạn nhỏ (chunk), chuyển mỗi chunk thành vector bằng embedding model, rồi lưu vào vector index.</div></div></li>
            <li><div><b>Tra cứu và trả lời (lúc user hỏi)</b><div className="d">Embed câu hỏi, tìm các chunk gần nghĩa nhất, ghép vào prompt, gọi LLM. Mục 02 vẽ chi tiết giai đoạn này.</div></div></li>
          </ol>

          <h3>Thuật ngữ</h3>
          <div className="pp">
            <div><span className="pl">Chunk</span>Một đoạn nhỏ cắt ra từ tài liệu (vài trăm token), đơn vị để tìm và đưa vào prompt.</div>
            <div><span className="pl">Embedding</span>Vector số biểu diễn ý nghĩa của một đoạn văn. Hai đoạn cùng nghĩa thì vector gần nhau.</div>
            <div><span className="pl">Vector index / vector DB</span>Nơi lưu embedding và tìm nhanh các vector gần nhất (pgvector, Pinecone, Qdrant, OpenSearch...).</div>
            <div><span className="pl">Hybrid search</span>Kết hợp tìm theo nghĩa (vector) với tìm theo từ khoá (BM25) để không lọt tên riêng, mã số.</div>
            <div><span className="pl">Top-K</span>Số chunk gần nhất được lấy về cho mỗi câu hỏi, thường 3–10.</div>
            <div><span className="pl">Augmented prompt</span>Prompt cuối cùng gửi cho LLM: hướng dẫn + các chunk tìm được + câu hỏi.</div>
          </div>
        </section>

        <section id="rag-classic">
          <h2><span className="n">02</span>RAG: một lượt, đường cố định</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 380" role="img" aria-label="RAG: user gửi query tới LLM app, app chuyển query cho retriever, retriever embed và tìm trong vector index, lấy top-K chunk, prompt builder ghép query với chunk thành prompt, LLM trả lời, app trả response cho user">
                <Markers id="rg" />
                <Box x={20} y={40} w={120} title="User" />
                <Box x={220} y={40} w={140} title="LLM App" />
                <Box x={720} y={40} w={160} title="LLM" cls="s-hl" />
                <Box x={220} y={200} w={140} title="Retriever" />
                <Box x={500} y={200} w={160} title="Prompt Builder" />
                <Box x={160} y={300} w={260} h={56} title="Vector / Hybrid index" sub="PDF · Docs · Code · Search index" cls="s-disk" />

                <path className="s-ln" d="M140 56 H218" markerEnd="url(#rga)" />
                <text className="s-tm" x="180" y="49" textAnchor="middle">1 query</text>
                <path className="s-ln" d="M220 76 H142" markerEnd="url(#rga)" />
                <text className="s-tm" x="180" y="92" textAnchor="middle">8 response</text>

                <path className="s-ln" d="M290 90 V198" markerEnd="url(#rga)" />
                <text className="s-tm" x="298" y="150">2 query</text>

                <path className="s-ln" d="M250 250 V298" markerEnd="url(#rga)" />
                <text className="s-tm" x="242" y="270" textAnchor="end">3 embed</text>
                <text className="s-tm" x="242" y="284" textAnchor="end">+ search</text>
                <path className="s-ln" d="M330 300 V252" markerEnd="url(#rga)" />
                <text className="s-tm" x="338" y="280">4 top-K chunks</text>

                <path className="s-ln" d="M360 225 H498" markerEnd="url(#rga)" />
                <text className="s-tm" x="430" y="217" textAnchor="middle">5 query + chunks</text>

                <path className="s-ln" d="M660 225 H800 V92" markerEnd="url(#rga)" />
                <text className="s-tm" x="808" y="160">6 augmented</text>
                <text className="s-tm" x="808" y="174">prompt</text>

                <path className="s-ln" d="M720 65 H362" markerEnd="url(#rga)" />
                <text className="s-tm" x="540" y="57" textAnchor="middle">7 answer</text>

                <text className="s-tm" x="440" y="324">nạp sẵn (offline): cắt chunk → embed → lưu index</text>
                <text className="s-tm" x="440" y="342">lúc hỏi chỉ còn bước tìm, không có vòng lặp</text>
              </svg>
            </div>
            <figcaption>Tám bước luôn chạy theo cùng một thứ tự. Câu trả lời tốt hay dở phụ thuộc gần như hoàn toàn vào việc bước 3–4 có lấy đúng chunk hay không.</figcaption>
          </figure>
          <ol className="steps">
            <li><div><b>User hỏi</b><div className="d">App nhận câu hỏi (1) và chuyển cho retriever (2).</div></div></li>
            <li><div><b>Tìm</b><div className="d">Retriever embed câu hỏi thành vector, tìm trong vector index hoặc hybrid index (vector + keyword) (3), lấy về K chunk gần nhất (4).</div></div></li>
            <li><div><b>Ghép prompt</b><div className="d">Prompt builder ghép câu hỏi với các chunk thành augmented prompt (5, 6).</div></div></li>
            <li><div><b>Trả lời</b><div className="d">LLM sinh câu trả lời dựa trên context đã cho (7), app trả về cho user (8).</div></div></li>
          </ol>
        </section>

        <section id="rag-agentic">
          <h2><span className="n">03</span>Agentic RAG: vòng lặp tìm, kiểm, tìm lại</h2>
          <p><b>Agentic RAG</b> là RAG mà bước tìm do một <b>AI agent</b> điều khiển: agent tự quyết định tìm ở đâu, bằng công cụ nào, rồi tự đánh giá kết quả và tìm tiếp nếu chưa đủ, thay vì chạy một lượt tìm cố định.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 450" role="img" aria-label="Agentic RAG: user gửi query tới LLM app, app giao task cho agent orchestrator, orchestrator chọn tool như vector DB, docs, web search, API, SQL, MCP, lấy evidence, evaluator agent so evidence với task; chưa đủ thì quay lại orchestrator viết lại query hoặc đổi nguồn, tối đa vài lần; đủ thì context builder ghép prompt, LLM trả lời, app trả response cho user">
                <Markers id="ag" />
                <Box x={20} y={40} w={120} title="User" />
                <Box x={220} y={40} w={140} title="LLM App" />
                <Box x={420} y={40} w={160} title="Agent" sub="Orchestrator" cls="s-hl" />

                <rect className="s-bg" x="700" y="14" width="186" height="176" rx="10" />
                <text className="s-lane" x="712" y="34">TOOLS & NGUỒN</text>
                {[["Vector DB", 712, 46], ["Docs", 798, 46], ["Web search", 712, 90], ["APIs", 798, 90], ["SQL / CRM", 712, 134], ["MCP server", 798, 134]].map(([t, x, y]) => (
                  <g key={t as string}>
                    <rect className="s-box" x={x as number} y={y as number} width="80" height="36" rx="6" />
                    <text className="s-tm" x={(x as number) + 40} y={(y as number) + 22} textAnchor="middle" style={{ fill: "var(--ink)" }}>{t}</text>
                  </g>
                ))}

                <Box x={720} y={270} w={160} title="Retrieved" sub="evidence" cls="s-disk" />
                <Box x={420} y={270} w={160} title="Evaluator" sub="Agent" cls="s-hl" />
                <Box x={420} y={380} w={160} title="Context Builder" />
                <Box x={220} y={380} w={140} title="LLM" cls="s-hl" />

                <path className="s-ln" d="M140 56 H218" markerEnd="url(#aga)" />
                <text className="s-tm" x="180" y="49" textAnchor="middle">1 query</text>
                <path className="s-ln" d="M220 76 H142" markerEnd="url(#aga)" />
                <text className="s-tm" x="180" y="92" textAnchor="middle">9 response</text>

                <path className="s-ln" d="M360 65 H418" markerEnd="url(#aga)" />
                <text className="s-tm" x="390" y="57" textAnchor="middle">2 task</text>

                <path className="s-ln" d="M580 65 H698" markerEnd="url(#aga)" />
                <text className="s-tm" x="640" y="57" textAnchor="middle">3 chọn tool</text>

                <path className="s-ln" d="M800 190 V268" markerEnd="url(#aga)" />
                <text className="s-tm" x="808" y="234">4 lấy</text>
                <text className="s-tm" x="808" y="248">evidence</text>

                <path className="s-ln" d="M720 295 H582" markerEnd="url(#aga)" />
                <text className="s-tm" x="650" y="287" textAnchor="middle">5 so với task</text>

                <path d="M460 270 V92" style={{ stroke: "var(--bad)", strokeWidth: 1.8, fill: "none", strokeDasharray: "6 4" }} markerEnd="url(#agb)" />
                <text className="s-tm" x="470" y="150" style={{ fill: "var(--bad)" }}>chưa đủ: viết lại query</text>
                <text className="s-tm" x="470" y="166" style={{ fill: "var(--bad)" }}>hoặc đổi nguồn</text>
                <text className="s-tm" x="470" y="182" style={{ fill: "var(--bad)" }}>(tối đa ~5 lần)</text>

                <path d="M500 320 V378" style={{ stroke: "var(--ok)", strokeWidth: 1.8, fill: "none" }} markerEnd="url(#agc)" />
                <text className="s-tm" x="508" y="354" style={{ fill: "var(--ok)" }}>6 đủ evidence</text>

                <path className="s-ln" d="M420 405 H362" markerEnd="url(#aga)" />
                <text className="s-tm" x="391" y="397" textAnchor="middle">7 prompt</text>

                <path className="s-ln" d="M290 380 V92" markerEnd="url(#aga)" />
                <text className="s-tm" x="298" y="240">8 answer</text>
              </svg>
            </div>
            <figcaption>Bước 3 → 4 → 5 là một vòng lặp. Đường đỏ nét đứt là lúc evaluator thấy bằng chứng chưa đủ và trả việc lại cho orchestrator; đường xanh là lúc đã đủ để đi tiếp.</figcaption>
          </figure>
          <ol className="steps">
            <li><div><b>Nhận task</b><div className="d">App giao câu hỏi cho agent orchestrator (1, 2).</div></div></li>
            <li><div><b>Chọn công cụ</b><div className="d">Agent tự quyết nên hỏi nguồn nào: vector DB, tài liệu, web search, API nội bộ, SQL/CRM hay một MCP server (3), rồi lấy evidence về (4).</div></div></li>
            <li><div><b>Kiểm tra</b><div className="d">Evaluator agent so evidence với task (5). Chưa đủ thì quay lại orchestrator: viết lại query, đổi nguồn hoặc đổi tool. Vòng lặp có giới hạn số lần để không chạy mãi.</div></div></li>
            <li><div><b>Trả lời</b><div className="d">Đủ evidence (6) thì context builder ghép prompt (7), LLM trả lời (8), app trả về cho user (9).</div></div></li>
          </ol>
        </section>

        <section id="rag-compare">
          <h2><span className="n">04</span>So sánh</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Tiêu chí</th><th>RAG</th><th>Agentic RAG</th></tr>
              </thead>
              <tbody>
                <tr><td><b>Luồng</b></td><td>Cố định: tìm → ghép → trả lời</td><td>Vòng lặp: chọn tool → lấy → kiểm → lặp lại nếu thiếu</td></tr>
                <tr><td><b>Nguồn dữ liệu</b></td><td>Thường một index đã nạp sẵn</td><td>Nhiều nguồn, chọn lúc chạy: index, web, API, SQL, MCP</td></tr>
                <tr><td><b>Ai quyết định tìm gì</b></td><td>Code (retriever, top-K cố định)</td><td>LLM agent</td></tr>
                <tr><td><b>Kiểm chất lượng context</b></td><td>Không; lấy sai chunk là trả lời sai</td><td>Có evaluator, tự sửa query khi thiếu</td></tr>
                <tr><td><b>Số lần gọi LLM</b></td><td>1</td><td>Nhiều (orchestrator, evaluator, câu trả lời cuối)</td></tr>
                <tr><td><b>Độ trễ, chi phí</b></td><td>Thấp, dễ đoán</td><td>Cao hơn, thay đổi theo số vòng</td></tr>
                <tr><td><b>Debug</b></td><td>Dễ: xem chunk nào được lấy</td><td>Khó hơn: cần trace từng bước của agent</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="rag-code">
          <h2><span className="n">05</span>Phác thảo code</h2>
          <Code lang="ts">{`// RAG: một lượt
async function rag(question: string) {
  const chunks = await index.search(await embed(question), { topK: 5 });
  return llm.generate(buildPrompt(question, chunks));
}

// Agentic RAG: lặp cho tới khi evidence đủ hoặc hết lượt
async function agenticRag(task: string, maxTries = 5) {
  const evidence: Evidence[] = [];
  let query = task;
  for (let i = 0; i < maxTries; i++) {
    const tool = await orchestrator.pickTool(task, query, evidence); // vectorDb | web | sql | api | mcp
    evidence.push(...(await tool.run(query)));
    const verdict = await evaluator.check(task, evidence);            // đủ để trả lời chưa?
    if (verdict.enough) break;
    query = verdict.nextQuery;                                         // viết lại query hoặc gợi ý nguồn khác
  }
  return llm.generate(buildContext(task, evidence));
}`}</Code>
        </section>

        <section id="rag-when">
          <h2><span className="n">06</span>Khi nào dùng</h2>
          <div className="cmp">
            <div><h4>RAG</h4>Câu hỏi tra cứu trong một kho tài liệu rõ ràng (FAQ, tài liệu nội bộ, chính sách). Cần nhanh, rẻ, dễ đoán.</div>
            <div><h4>Agentic RAG</h4>Câu hỏi nhiều bước, cần ghép dữ liệu từ nhiều nguồn (tài liệu + DB + API), hoặc câu hỏi mơ hồ mà lần tìm đầu thường trượt.</div>
          </div>
          <div className="note tip">Nên bắt đầu bằng RAG thường và đo chất lượng. Chỉ chuyển sang agentic khi thấy lỗi nằm ở bước tìm (thiếu nguồn, query kém), và luôn đặt giới hạn số vòng lặp, timeout, chi phí.</div>
        </section>
      </main>
    </div>
  );
}

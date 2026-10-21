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
      <nav className="toc" aria-label="RAG contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#rag-what"><span>01</span>What is RAG</a></li>
          <li><a href="#rag-classic"><span>02</span>RAG</a></li>
          <li><a href="#rag-agentic"><span>03</span>Agentic RAG</a></li>
          <li><a href="#rag-compare"><span>04</span>Compare</a></li>
          <li><a href="#rag-code"><span>05</span>Code sketch</a></li>
          <li><a href="#rag-when"><span>06</span>When to use</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">ai · rag vs agentic rag</div>
          <h1>RAG vs Agentic RAG</h1>
          <p className="lede">Both pull outside data into the prompt so the LLM answers more accurately. The difference: RAG retrieves <b>once</b> along a fixed path, while Agentic RAG lets an agent <b>pick its own tools, check the result</b> and search again until it has enough evidence.</p>
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
          <h2><span className="n">01</span>What is RAG</h2>
          <p><b>RAG (Retrieval-Augmented Generation)</b> is a technique that makes an LLM <b>look things up first, answer second</b>: before generating an answer, the system searches its own data for passages relevant to the question and puts them into the prompt as context. The LLM answers from that context instead of relying only on what it learned during training.</p>
          <p>The name spells out the three parts: <b>Retrieval</b> (find the data), <b>Augmented</b> (add that data to the prompt), <b>Generation</b> (the LLM generates the answer).</p>

          <h3>Why RAG</h3>
          <div className="cmp">
            <div><h4>LLM alone</h4>Only knows data up to its training cutoff, and nothing about internal documents or fresh data. When it does not know, it can still make up a plausible-sounding answer (hallucination), and it cannot point to a source.</div>
            <div><h4>LLM + RAG</h4>Answers from real, up-to-date data, including the company&apos;s private data. It can cite sources. Updating its knowledge only means re-indexing documents, not retraining the model.</div>
          </div>
          <div className="note tip">RAG is not fine-tuning: fine-tuning teaches the model a <b>way of working</b> (tone, format, skills) by training it again; RAG hands the model <b>facts</b> at question time. For knowledge that changes often, use RAG.</div>

          <h3>Two phases</h3>
          <ol className="steps">
            <li><div><b>Indexing (ahead of time)</b><div className="d">Read the documents (PDF, docs, code, web pages), split them into small pieces (chunks), turn each chunk into a vector with an embedding model, and store them in a vector index.</div></div></li>
            <li><div><b>Retrieve and answer (when the user asks)</b><div className="d">Embed the question, find the closest chunks, put them into the prompt, call the LLM. Section 02 draws this phase in detail.</div></div></li>
          </ol>

          <h3>Terms</h3>
          <div className="pp">
            <div><span className="pl">Chunk</span>A small piece cut from a document (a few hundred tokens); the unit that gets searched and put into the prompt.</div>
            <div><span className="pl">Embedding</span>A vector of numbers representing the meaning of a passage. Passages with similar meaning have nearby vectors.</div>
            <div><span className="pl">Vector index / vector DB</span>Stores embeddings and quickly finds the nearest vectors (pgvector, Pinecone, Qdrant, OpenSearch...).</div>
            <div><span className="pl">Hybrid search</span>Combines meaning-based (vector) search with keyword search (BM25) so names and IDs are not missed.</div>
            <div><span className="pl">Top-K</span>How many of the closest chunks are fetched per question, usually 3–10.</div>
            <div><span className="pl">Augmented prompt</span>The final prompt sent to the LLM: instructions + retrieved chunks + the question.</div>
          </div>
        </section>

        <section id="rag-classic">
          <h2><span className="n">02</span>RAG: one pass, fixed path</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 380" role="img" aria-label="RAG: the user sends a query to the LLM app, the app passes it to the retriever, the retriever embeds it and searches the vector index, gets the top-K chunks, the prompt builder combines query and chunks into a prompt, the LLM answers, the app returns the response to the user">
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

                <text className="s-tm" x="440" y="324">built offline: chunk → embed → store in index</text>
                <text className="s-tm" x="440" y="342">at query time it only searches; no loop</text>
              </svg>
            </div>
            <figcaption>The eight steps always run in the same order. Answer quality depends almost entirely on whether steps 3–4 fetch the right chunks.</figcaption>
          </figure>
          <ol className="steps">
            <li><div><b>User asks</b><div className="d">The app receives the question (1) and hands it to the retriever (2).</div></div></li>
            <li><div><b>Retrieve</b><div className="d">The retriever embeds the question into a vector, searches a vector or hybrid (vector + keyword) index (3) and gets back the K closest chunks (4).</div></div></li>
            <li><div><b>Build the prompt</b><div className="d">The prompt builder combines the question and chunks into an augmented prompt (5, 6).</div></div></li>
            <li><div><b>Answer</b><div className="d">The LLM generates an answer from the given context (7) and the app returns it to the user (8).</div></div></li>
          </ol>
        </section>

        <section id="rag-agentic">
          <h2><span className="n">03</span>Agentic RAG: search, check, search again</h2>
          <p><b>Agentic RAG</b> is RAG where retrieval is driven by an <b>AI agent</b>: the agent decides where to search and with which tool, then judges the result and keeps searching if it is not enough, instead of running one fixed retrieval pass.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 450" role="img" aria-label="Agentic RAG: the user sends a query to the LLM app, the app gives the task to the agent orchestrator, which selects tools such as a vector DB, docs, web search, APIs, SQL, MCP and fetches evidence; the evaluator agent checks the evidence against the task; if not enough it goes back to the orchestrator to rewrite the query or switch source, a few times at most; once enough, the context builder builds the prompt, the LLM answers and the app returns the response to the user">
                <Markers id="ag" />
                <Box x={20} y={40} w={120} title="User" />
                <Box x={220} y={40} w={140} title="LLM App" />
                <Box x={420} y={40} w={160} title="Agent" sub="Orchestrator" cls="s-hl" />

                <rect className="s-bg" x="700" y="14" width="186" height="176" rx="10" />
                <text className="s-lane" x="712" y="34">TOOLS & SOURCES</text>
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
                <text className="s-tm" x="640" y="57" textAnchor="middle">3 select tools</text>

                <path className="s-ln" d="M800 190 V268" markerEnd="url(#aga)" />
                <text className="s-tm" x="808" y="234">4 fetch</text>
                <text className="s-tm" x="808" y="248">evidence</text>

                <path className="s-ln" d="M720 295 H582" markerEnd="url(#aga)" />
                <text className="s-tm" x="650" y="287" textAnchor="middle">5 check vs task</text>

                <path d="M460 270 V92" style={{ stroke: "var(--bad)", strokeWidth: 1.8, fill: "none", strokeDasharray: "6 4" }} markerEnd="url(#agb)" />
                <text className="s-tm" x="470" y="150" style={{ fill: "var(--bad)" }}>not enough: rewrite query</text>
                <text className="s-tm" x="470" y="166" style={{ fill: "var(--bad)" }}>or switch source</text>
                <text className="s-tm" x="470" y="182" style={{ fill: "var(--bad)" }}>(max ~5 tries)</text>

                <path d="M500 320 V378" style={{ stroke: "var(--ok)", strokeWidth: 1.8, fill: "none" }} markerEnd="url(#agc)" />
                <text className="s-tm" x="508" y="354" style={{ fill: "var(--ok)" }}>6 enough evidence</text>

                <path className="s-ln" d="M420 405 H362" markerEnd="url(#aga)" />
                <text className="s-tm" x="391" y="397" textAnchor="middle">7 prompt</text>

                <path className="s-ln" d="M290 380 V92" markerEnd="url(#aga)" />
                <text className="s-tm" x="298" y="240">8 answer</text>
              </svg>
            </div>
            <figcaption>Steps 3 → 4 → 5 form a loop. The dashed red path is the evaluator deciding the evidence is not enough and handing the work back to the orchestrator; the green path is when it is enough to move on.</figcaption>
          </figure>
          <ol className="steps">
            <li><div><b>Receive the task</b><div className="d">The app hands the question to the agent orchestrator (1, 2).</div></div></li>
            <li><div><b>Pick tools</b><div className="d">The agent decides which source to ask: a vector DB, documents, web search, internal APIs, SQL/CRM or an MCP server (3), then fetches evidence (4).</div></div></li>
            <li><div><b>Check</b><div className="d">The evaluator agent checks the evidence against the task (5). If it falls short, control goes back to the orchestrator to rewrite the query, switch source or switch tool. The loop has a retry cap so it cannot run forever.</div></div></li>
            <li><div><b>Answer</b><div className="d">With enough evidence (6) the context builder assembles the prompt (7), the LLM answers (8) and the app returns it to the user (9).</div></div></li>
          </ol>
        </section>

        <section id="rag-compare">
          <h2><span className="n">04</span>Compare</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Aspect</th><th>RAG</th><th>Agentic RAG</th></tr>
              </thead>
              <tbody>
                <tr><td><b>Flow</b></td><td>Fixed: retrieve → build prompt → answer</td><td>Loop: pick tool → fetch → check → repeat if short</td></tr>
                <tr><td><b>Data sources</b></td><td>Usually one pre-built index</td><td>Many, chosen at run time: index, web, APIs, SQL, MCP</td></tr>
                <tr><td><b>Who decides what to fetch</b></td><td>Code (retriever, fixed top-K)</td><td>The LLM agent</td></tr>
                <tr><td><b>Context quality check</b></td><td>None; wrong chunks mean a wrong answer</td><td>An evaluator that rewrites the query when evidence is short</td></tr>
                <tr><td><b>LLM calls</b></td><td>1</td><td>Several (orchestrator, evaluator, final answer)</td></tr>
                <tr><td><b>Latency, cost</b></td><td>Low, predictable</td><td>Higher, varies with the number of loops</td></tr>
                <tr><td><b>Debugging</b></td><td>Easy: look at which chunks were retrieved</td><td>Harder: needs a trace of every agent step</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="rag-code">
          <h2><span className="n">05</span>Code sketch</h2>
          <Code lang="ts">{`// RAG: one pass
async function rag(question: string) {
  const chunks = await index.search(await embed(question), { topK: 5 });
  return llm.generate(buildPrompt(question, chunks));
}

// Agentic RAG: loop until the evidence is enough or tries run out
async function agenticRag(task: string, maxTries = 5) {
  const evidence: Evidence[] = [];
  let query = task;
  for (let i = 0; i < maxTries; i++) {
    const tool = await orchestrator.pickTool(task, query, evidence); // vectorDb | web | sql | api | mcp
    evidence.push(...(await tool.run(query)));
    const verdict = await evaluator.check(task, evidence);            // enough to answer?
    if (verdict.enough) break;
    query = verdict.nextQuery;                                         // rewritten query or a hint to try another source
  }
  return llm.generate(buildContext(task, evidence));
}`}</Code>
        </section>

        <section id="rag-when">
          <h2><span className="n">06</span>When to use</h2>
          <div className="cmp">
            <div><h4>RAG</h4>Lookup questions over one well-defined corpus (FAQ, internal docs, policies). You need it fast, cheap and predictable.</div>
            <div><h4>Agentic RAG</h4>Multi-step questions that combine data from several sources (docs + DB + API), or vague questions where the first search often misses.</div>
          </div>
          <div className="note tip">Start with plain RAG and measure quality. Move to agentic only when the failures come from retrieval (missing sources, poor queries), and always cap the loop count, timeout and cost.</div>
        </section>
      </main>
    </div>
  );
}

import { Code } from "@/components/Code";
import { AnimFlow, ProsCons } from "@/components/AnimFlow";

export default function McpPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="MCP contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#mcp-overview"><span>01</span>What MCP is</a></li>
          <li><a href="#mcp-flow"><span>02</span>One tool call, step by step</a></li>
          <li><a href="#mcp-code"><span>03</span>JSON-RPC messages</a></li>
          <li><a href="#mcp-pros"><span>04</span>Strengths and limits</a></li>
          <li><a href="#mcp-pick"><span>05</span>Picking among the 6 API styles</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">mcp · study notes</div>
          <h1>MCP: the standard that connects agents to tools and data</h1>
          <p className="lede"><b>MCP (Model Context Protocol)</b> is an open protocol that lets an AI app (the host) connect an LLM (Large Language Model) to <b>tools</b>, <b>data</b> and <b>files</b> through one uniform interface, instead of a custom integration for every model–service pair.</p>
          <div className="tape" aria-hidden="true">
            <div>JSON-RPC 2.0</div>
            <div className="hw">stdio</div>
            <div>Streamable HTTP</div>
            <div>tools/call</div>
          </div>
        </header>
        <section id="mcp-overview">
          <h2><span className="n">01</span>What MCP is</h2>
          <ul className="plain">
            <li>The <b>host</b> (AI app) holds <b>clients</b>, each connected to one <b>MCP server</b>.</li>
            <li>A server exposes <b>tools</b> (actions), <b>resources</b> (data, files) and <b>prompts</b>.</li>
            <li>Transports: <b>stdio</b> (local process) or <b>Streamable HTTP</b> (remote). Messages are JSON-RPC 2.0.</li>
            <li>Unlike REST, tools are <b>discovered dynamically</b> at runtime and the LLM picks the right one.</li>
          </ul>
        </section>
        <section id="mcp-flow">
          <h2><span className="n">02</span>One tool call, step by step (animated)</h2>
          <AnimFlow
            label="The 5 steps of MCP"
            steps={[
              { title: "Host connects MCP server", sub: "initialize, negotiate" },
              { title: "tools/list discovery", sub: "fetch the tool list" },
              { title: "LLM selects tool", sub: "picks tool and arguments" },
              { title: "JSON-RPC tools/call", sub: "client sends the call" },
              { title: "Structured context return", sub: "result enters the context" },
            ]}
            caption="The model decides step 3; steps 4–5 repeat until the agent has enough to answer."
          />
        </section>
        <section id="mcp-code">
          <h2><span className="n">03</span>JSON-RPC messages</h2>
          <Code lang="json">{`{ "jsonrpc": "2.0", "id": 7, "method": "tools/call",
  "params": { "name": "search_orders", "arguments": { "status": "PAID" } } }`}</Code>
          <Code lang="json">{`{ "jsonrpc": "2.0", "id": 7,
  "result": { "content": [{ "type": "text", "text": "12 PAID orders" }] } }`}</Code>
          <p>The first block is the client calling a tool, the second is the server's reply (same <code>id</code>).</p>
        </section>
        <section id="mcp-pros">
          <h2><span className="n">04</span>Strengths and limits</h2>
          <ProsCons
            prosTitle="Strengths"
            consTitle="Limitations"
            pros={["Unified tool interface for AI", "Plug and play", "Decouples models from individual APIs"]}
            cons={["Large tool lists bloat the context window", "Spec moves fast, with breaking changes", "OAuth 2.1 setup is complex"]}
          />
          <div className="note">Tools from another server are untrusted data: tool descriptions and results can carry prompt injection. Grant least privilege and require confirmation for dangerous actions.</div>
        </section>
        <section id="mcp-pick">
          <h2><span className="n">05</span>Picking among the 6 API styles</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Style</th>
                  <th>Use when</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>REST</b></td><td>Public APIs, CRUD</td></tr>
                <tr><td><b>GraphQL</b></td><td>Complex UI, data graphs</td></tr>
                <tr><td><b>gRPC</b></td><td>Internal microservices</td></tr>
                <tr><td><b>WebSockets</b></td><td>Real-time voice, live sync</td></tr>
                <tr><td><b>Webhooks</b></td><td>Async batch jobs reporting completion</td></tr>
                <tr><td><b>MCP</b></td><td>Agents discovering and calling tools</td></tr>
              </tbody>
            </table>
          </div>
          <p>Choose by payload size, features needed, latency budget and how autonomous the agent is.</p>
        </section>
      </main>
    </div>
  );
}

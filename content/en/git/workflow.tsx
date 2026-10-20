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
      <nav className="toc" aria-label="Branching workflow contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#gw-gitflow"><span>01</span>Git Flow</a></li>
          <li><a href="#gw-github"><span>02</span>GitHub Flow</a></li>
          <li><a href="#gw-gitlab"><span>03</span>GitLab Flow</a></li>
          <li><a href="#gw-trunk"><span>04</span>Trunk-based</a></li>
          <li><a href="#gw-envs"><span>05</span>4 environments example</a></li>
          <li><a href="#gw-compare"><span>06</span>Comparison</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">git · branching workflow</div>
          <h1>Branching models</h1>
          <p className="lede">The team's conventions for which branches exist, how long they live, where they merge and how releases happen. Four common models, from the most branches to the fewest.</p>
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
          <p>Two long-lived branches: <code>main</code> holds only released versions, <code>develop</code> collects features for the next one. Three kinds of short-lived branches: <code>feature/*</code>, <code>release/*</code>, <code>hotfix/*</code>.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 250" role="img" aria-label="Git Flow: feature branches off develop and merges back into develop; release branches off develop and merges into main and develop; hotfix branches off main and merges into main and develop">
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
            <figcaption>Release and hotfix branches are merged into both <code>main</code> and <code>develop</code> (dashed) so the two never drift apart.</figcaption>
          </figure>
        </section>

        <section id="gw-github">
          <h2><span className="n">02</span>GitHub Flow</h2>
          <p>Only one long-lived branch, <code>main</code>, which is always deployable. Each task is a short branch with a pull request; after review it is merged and deployed right away.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 140" role="img" aria-label="GitHub Flow: short branches off main, open a pull request, merge back to main and deploy">
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
          <p>GitHub Flow plus <b>environment branches</b>: code merges into <code>main</code>, then is promoted to <code>staging</code> and <code>production</code> by merging. Another variant uses <code>release/1.x</code> branches for apps that maintain several versions.</p>
          <ul className="plain">
            <li>Fits when you need several environments and control over when code reaches production.</li>
            <li>Always fix in <code>main</code> first, then carry the fix down to the lower branches (upstream first).</li>
          </ul>
        </section>

        <section id="gw-trunk">
          <h2><span className="n">04</span>Trunk-based development</h2>
          <p>Everyone commits to one shared branch (the <b>trunk</b>, usually <code>main</code>) at least daily. Personal branches, if any, live less than a day. Unfinished features are hidden behind <b>feature flags</b> instead of being kept on branches.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 150" role="img" aria-label="Trunk-based: small commits flow continuously into trunk, branches live under a day, releases are cut from trunk">
                <text className="s-tm" x="16" y="74" style={{ fill: C.main }}>trunk</text>
                <text className="s-tm" x="16" y="124" style={{ fill: C.feat }}>{"branch < 1 day"}</text>
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
            <figcaption>Trunk stays green because CI runs on every commit. A release branch, if any, is cut from trunk and only receives cherry-picked fixes.</figcaption>
          </figure>
          <div className="note tip">How Google, Meta and many teams that deploy several times a day work. Prerequisites: good automated tests, fast reviews, feature flags.</div>
        </section>

        <section id="gw-envs">
          <h2><span className="n">05</span>Example: 4 environments dev, test, uat, prod</h2>
          <p>Environments need not be branches. There are two common setups.</p>

          <h3>Option 1: one branch per environment</h3>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 236" role="img" aria-label="One branch per environment: feature merges into develop which deploys DEV, develop merges up to test which deploys TEST, test merges up to uat which deploys UAT, uat merges up to main which deploys PROD; a hotfix from main is merged back down to uat, test and develop">
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
                <text className="s-tm" x="420" y="226" textAnchor="middle">merge up one level at a time</text>
                <text className="s-tm" x="700" y="226" textAnchor="middle" style={{ fill: C.fix }}>hotfix: merge back down</text>
              </svg>
            </div>
          </figure>
          <ul className="plain">
            <li>Pushing to a branch makes CI/CD deploy to that environment. Code flows one way only: <code>develop</code> → <code>test</code> → <code>uat</code> → <code>main</code>.</li>
            <li>Urgent production bug: create <code>hotfix/*</code> from <code>main</code>, merge into <code>main</code>, then merge back down to <code>uat</code>, <code>test</code>, <code>develop</code>.</li>
            <li><b>Downside:</b> four branches drift easily, and every environment builds again, so what runs in prod is not exactly the build tested in UAT.</li>
          </ul>

          <h3>Option 2: one branch, promote the same build through environments</h3>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 230" role="img" aria-label="A single main branch: merge a PR into main, build once into image v1.4.0, promote that image automatically to DEV then TEST, then by manual approval to UAT and PROD">
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
                <text className="s-tb" x="342" y="77">Build once</text>
                <text className="s-tm" x="342" y="93">image order-svc:v1.4.0</text>
                <path className="s-dl" d="M262 36 C290 60 300 78 328 78" markerEnd="url(#gwa)" />
                {[["DEV", "automatic", 130], ["TEST", "automatic", 330], ["UAT", "approval", 530], ["PROD", "approval", 730]].map(([env, how, x]) => (
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
            <li>Only <code>main</code> and feature branches. Every merge into <code>main</code> makes CI <b>build once</b> into an image or tag, for example <code>v1.4.0</code>.</li>
            <li>That build is promoted dev → test → uat → prod. Going to UAT and prod needs someone to approve (GitHub Environments, GitLab manual jobs).</li>
            <li>What runs in prod is exactly what was tested in UAT. Unfinished features are hidden behind feature flags.</li>
          </ul>
          <div className="note tip"><b>Which to pick:</b> a new team with simple CI/CD → option 1 is easier to grasp. Already building Docker images → option 2, which most large teams use.</div>
        </section>

        <section id="gw-compare">
          <h2><span className="n">06</span>Comparison</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Long-lived branches</th>
                  <th>Release</th>
                  <th>Good for</th>
                  <th>Downsides</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Git Flow</b></td>
                  <td><code>main</code>, <code>develop</code></td>
                  <td>By version, via <code>release/*</code></td>
                  <td>Mobile, desktop, libraries: batched releases, several maintained versions</td>
                  <td>Many branches, complex merges, slow integration</td>
                </tr>
                <tr>
                  <td><b>GitHub Flow</b></td>
                  <td><code>main</code></td>
                  <td>Deploy ngay sau khi merge PR</td>
                  <td>Web, SaaS, small and medium teams</td>
                  <td>Hard to maintain several versions in parallel</td>
                </tr>
                <tr>
                  <td><b>GitLab Flow</b></td>
                  <td><code>main</code> + environment branches</td>
                  <td>Merged step by step into <code>staging</code>, <code>production</code></td>
                  <td>Several environments, controlled production releases</td>
                  <td>More branches, environments drift easily</td>
                </tr>
                <tr>
                  <td><b>Trunk-based</b></td>
                  <td><code>main</code> (trunk)</td>
                  <td>Continuously from trunk, toggled by feature flags</td>
                  <td>Teams with strong CI/CD deploying many times a day</td>
                  <td>Needs discipline, good automated tests, flag management</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Quick pick:</b> web with continuous deploys → GitHub Flow or Trunk-based. Versioned apps with batched releases → Git Flow. Separate staging and production → GitLab Flow. For how to combine branches see <Link className="plink" href="/en/git/merge-rebase/">Merge vs Rebase</Link>.</div>
        </section>
      </main>
    </div>
  );
}

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
      <nav className="toc" aria-label="Merge and rebase contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#mr-graph"><span>01</span>Four ways to combine</a></li>
          <li><a href="#mr-cmd"><span>02</span>Commands</a></li>
          <li><a href="#mr-compare"><span>03</span>Comparison</a></li>
          <li><a href="#mr-rule"><span>04</span>Rules</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">git · merge vs rebase</div>
          <h1>Merge, Rebase, Squash, Cherry-pick</h1>
          <p className="lede">They all move commits from one branch to another, but each leaves a different history behind.</p>
          <div className="tape" aria-hidden="true">
            <div>merge</div>
            <div>rebase</div>
            <div>--squash</div>
            <div className="hw">cherry-pick</div>
            <div className="leo">--force-with-lease</div>
          </div>
        </header>

        <section id="mr-graph">
          <h2><span className="n">01</span>Four ways to combine</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 400" role="img" aria-label="Initially feature branches from B with D and E, and main has gained C. Merge creates commit M joining both. Rebase copies D and E as D' and E' after C. Squash folds D and E into one commit S. Cherry-pick copies only E as E' onto main">
                <text className="s-tb" x="16" y="44">Initially</text>
                <Line d="M150 40 H300" c={MAIN} />
                <Line d="M240 40 C260 40 260 80 280 80 H350" c={FEAT} />
                <Commit x={180} y={40} label="A" c={MAIN} /><Commit x={240} y={40} label="B" c={MAIN} /><Commit x={300} y={40} label="C" c={MAIN} />
                <Commit x={300} y={80} label="D" c={FEAT} /><Commit x={360} y={80} label="E" c={FEAT} />
                <text className="s-tm" x="500" y="44">feature branched from B; main has gained C</text>

                <text className="s-tb" x="16" y="124">merge</text>
                <Line d="M150 120 H420" c={MAIN} />
                <Line d="M240 120 C260 120 260 160 280 160 H360 C390 160 390 120 420 120" c={FEAT} />
                <Commit x={180} y={120} label="A" c={MAIN} /><Commit x={240} y={120} label="B" c={MAIN} /><Commit x={300} y={120} label="C" c={MAIN} />
                <Commit x={300} y={160} label="D" c={FEAT} /><Commit x={360} y={160} label="E" c={FEAT} />
                <Commit x={420} y={120} label="M" c={MAIN} />
                <text className="s-tm" x="500" y="124">keeps D, E; adds merge commit M with two parents</text>

                <text className="s-tb" x="16" y="214">rebase</text>
                <Line d="M150 210 H420" c={MAIN} />
                <Commit x={180} y={210} label="A" c={MAIN} /><Commit x={240} y={210} label="B" c={MAIN} /><Commit x={300} y={210} label="C" c={MAIN} />
                <Commit x={360} y={210} label="D'" c={FEAT} /><Commit x={420} y={210} label="E'" c={FEAT} />
                <text className="s-tm" x="500" y="214">copies D, E after C as new commits; linear history</text>

                <text className="s-tb" x="16" y="284">squash</text>
                <Line d="M150 280 H360" c={MAIN} />
                <Commit x={180} y={280} label="A" c={MAIN} /><Commit x={240} y={280} label="B" c={MAIN} /><Commit x={300} y={280} label="C" c={MAIN} />
                <Commit x={360} y={280} label="S" c={FEAT} />
                <text className="s-tm" x="500" y="284">folds D + E into one commit S on main</text>

                <text className="s-tb" x="16" y="354">cherry-pick</text>
                <Line d="M150 350 H360" c={MAIN} />
                <Commit x={180} y={350} label="A" c={MAIN} /><Commit x={240} y={350} label="B" c={MAIN} /><Commit x={300} y={350} label="C" c={MAIN} />
                <Commit x={360} y={350} label="E'" c={FEAT} />
                <text className="s-tm" x="500" y="354">copies only E onto main; D stays on feature</text>
              </svg>
            </div>
            <figcaption>Teal commits belong to <code>main</code>, orange ones come from <code>feature</code>. Primes (D', E') are copies: same content, different hash.</figcaption>
          </figure>
        </section>

        <section id="mr-cmd">
          <h2><span className="n">02</span>Commands</h2>
          <Code lang="bash">{`# merge: bring feature into main with a merge commit
git switch main
git merge feature            # --no-ff: always create a merge commit; --ff-only: fast-forward only

# rebase: move feature onto the latest main
git switch feature
git rebase main              # on conflict: fix, git add, git rebase --continue (or --abort)
git rebase -i main           # tidy commits: squash, reword, drop, reorder
git push --force-with-lease  # a branch pushed earlier must be force-pushed after a rebase

# squash merge: the whole branch as one commit
git switch main
git merge --squash feature && git commit -m "feat: checkout v2"

# cherry-pick: copy one specific commit
git switch release/1.4
git cherry-pick 3f2a9c1

# pull with rebase instead of creating merge commits
git config --global pull.rebase true`}</Code>
        </section>

        <section id="mr-compare">
          <h2><span className="n">03</span>Comparison</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Approach</th>
                  <th>History</th>
                  <th>New hashes</th>
                  <th>Conflicts</th>
                  <th>Use when</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>merge</b></td>
                  <td>Preserved, with a merge commit, tree-shaped</td>
                  <td>No</td>
                  <td>Resolved once</td>
                  <td>Merging shared branches (release → main); when the exact trail matters</td>
                </tr>
                <tr>
                  <td><b>rebase</b></td>
                  <td>Linear, no merge commits</td>
                  <td>Yes</td>
                  <td>May need resolving at each commit</td>
                  <td>Updating your own feature branch from main; tidying commits before a PR</td>
                </tr>
                <tr>
                  <td><b>squash</b></td>
                  <td>One commit for the whole branch</td>
                  <td>Yes</td>
                  <td>Resolved once</td>
                  <td>Small PRs, a clean main; accept losing per-commit detail</td>
                </tr>
                <tr>
                  <td><b>cherry-pick</b></td>
                  <td>Copies a few individual commits</td>
                  <td>Yes</td>
                  <td>Per commit</td>
                  <td>Bringing a fix onto a release or hotfix branch</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="mr-rule">
          <h2><span className="n">04</span>Rules</h2>
          <ul className="plain">
            <li><b>Never rebase commits that are on a branch others share</b> (main, develop). Rebasing creates new hashes and everyone else's history diverges.</li>
            <li>Rebase your own branches freely. Push back with <code>--force-with-lease</code>: it refuses if the remote has commits you haven't seen, safer than <code>--force</code>.</li>
            <li>A common flow: rebase the feature onto main while working, then merge (or squash merge) through a pull request.</li>
            <li>Made a mistake? <code>git reflog</code> finds your old commits.</li>
          </ul>
          <div className="note tip">The way you combine goes hand in hand with your branching model; see <Link className="plink" href="/en/git/workflow/">Branching workflow</Link>. Trunk-based teams usually rebase and squash to keep trunk linear.</div>
        </section>
      </main>
    </div>
  );
}

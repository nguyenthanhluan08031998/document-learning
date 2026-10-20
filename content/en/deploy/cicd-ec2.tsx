import { Code } from "@/components/Code";

export default function CicdEc2Page() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="CI/CD to EC2 contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#ce-flow"><span>01</span>Overall flow</a></li>
          <li><a href="#ce-prep"><span>02</span>Preparing EC2</a></li>
          <li><a href="#ce-pipeline"><span>03</span>Sample pipeline</a></li>
          <li><a href="#ce-rollback"><span>04</span>Health check and rollback</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">deployment · ci/cd</div>
          <h1>CI/CD to EC2</h1>
          <p className="lede">Push code and it is tested, built into an image, pushed to a registry, and the container on EC2 is updated.</p>
        </header>

        <section id="ce-flow">
          <h2><span className="n">01</span>Overall flow</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 250" role="img" aria-label="A developer pushes code; CI runs tests, builds an image and pushes it to ECR tagged with the commit; CD reaches EC2 over SSH or SSM, docker pulls the new image, runs docker compose up -d and calls the health check; on failure it returns to the previous tag"> <defs><marker id="cea" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs> <rect className="s-box" x="16" y="40" width="130" height="58" rx="7" /><text className="s-tb" x="28" y="64">git push</text><text className="s-tm" x="28" y="84">main branch</text> <path className="s-ln" d="M146 69 H180" markerEnd="url(#cea)" /> <rect className="s-hl" x="182" y="24" width="300" height="90" rx="8" /><text className="s-tb" x="196" y="48">CI</text><text className="s-tm" x="196" y="70" style={{ fill: "var(--ink)" }}>1. install, lint, test</text><text className="s-tm" x="196" y="88" style={{ fill: "var(--ink)" }}>2. docker build</text><text className="s-tm" x="196" y="106" style={{ fill: "var(--ink)" }}>   tag = commit SHA</text> <path className="s-ln" d="M482 69 H520" markerEnd="url(#cea)" /> <rect className="s-disk" x="522" y="40" width="150" height="58" rx="7" /><text className="s-tb" x="534" y="64">ECR</text><text className="s-tm" x="534" y="84">order-svc:a1b2c3d</text> <path className="s-ln" d="M672 69 H708" markerEnd="url(#cea)" /> <rect className="s-hl" x="710" y="24" width="174" height="90" rx="8" /><text className="s-tb" x="724" y="48">CD</text><text className="s-tm" x="724" y="70" style={{ fill: "var(--ink)" }}>into EC2 via</text><text className="s-tm" x="724" y="88" style={{ fill: "var(--ink)" }}>SSH or SSM</text> <path className="s-ln" d="M797 114 V150" markerEnd="url(#cea)" /> <rect className="s-box" x="16" y="152" width="868" height="76" rx="8" /><text className="s-tb" x="30" y="176">EC2</text><text className="s-tm" x="30" y="198" style={{ fill: "var(--ink)" }}>docker pull order-svc:a1b2c3d → docker compose up -d → curl /health</text><text className="s-tm" x="30" y="216">health fails: rerun the previous tag (rollback)</text> </svg>
            </div>
            <figcaption>CI only produces images; CD only chooses which image runs on the server. Tagging by commit SHA tells you exactly which code is running and lets you go back.</figcaption>
          </figure>
        </section>

        <section id="ce-prep">
          <h2><span className="n">02</span>Preparing EC2</h2>
          <div className="tbl">
            <table>
              <thead><tr><th>Task</th><th>Notes</th></tr></thead>
              <tbody>
                <tr><td>Install Docker and docker compose</td><td>Once when creating the machine (or use a ready AMI).</td></tr>
                <tr><td>IAM role for EC2</td><td>Permission to pull from ECR; no access keys stored on the machine.</td></tr>
                <tr><td>Security group</td><td>Open 80/443 to users; open SSH only to the CI's IP, or use SSM instead of SSH.</td></tr>
                <tr><td>Compose file and .env</td><td>Kept on the machine; secrets come from SSM Parameter Store or Secrets Manager, never committed.</td></tr>
                <tr><td>Pipeline secrets</td><td>AWS role (OIDC) or keys, EC2 host, SSH key — stored in the CI's secrets.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="ce-pipeline">
          <h2><span className="n">03</span>Sample pipeline (GitHub Actions)</h2>
          <Code lang="yaml">{`on: { push: { branches: [main] } }
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions: { id-token: write, contents: read }
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: \${{ secrets.AWS_ROLE }}
          aws-region: ap-southeast-1
      - uses: aws-actions/amazon-ecr-login@v2
        id: ecr
      - run: |
          IMAGE=\${{ steps.ecr.outputs.registry }}/order-svc:\${{ github.sha }}
          docker build -t $IMAGE . && docker push $IMAGE
      - uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.EC2_HOST }}
          username: ec2-user
          key: \${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /opt/order-svc
            TAG=\${{ github.sha }} docker compose pull
            TAG=\${{ github.sha }} docker compose up -d
            curl -fsS localhost:3000/health`}</Code>
          <p>Azure Pipelines or GitLab CI follow the same steps: test → build → push → into EC2 → pull → up → health check.</p>
        </section>

        <section id="ce-rollback">
          <h2><span className="n">04</span>Health check and rollback</h2>
          <div className="tbl">
            <table>
              <thead><tr><th>Problem</th><th>Fix</th></tr></thead>
              <tbody>
                <tr><td>The new version is broken</td><td>Rerun <code>TAG=&lt;old sha&gt; docker compose up -d</code>; the old image is still in ECR.</td></tr>
                <tr><td>Downtime while swapping containers</td><td>Run 2 containers behind Nginx/ALB and swap them one at a time; or several EC2s behind an ALB, updated one by one.</td></tr>
                <tr><td>Not sure which version is running</td><td>Tag images with the commit SHA and return the SHA from <code>/health</code>.</td></tr>
                <tr><td>Disk full of old images</td><td>Add <code>docker image prune -f</code> after a successful deploy.</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

import { Code } from "@/components/Code";

export default function CicdEc2Page() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục CI/CD lên EC2">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#ce-flow"><span>01</span>Luồng tổng</a></li>
          <li><a href="#ce-prep"><span>02</span>Chuẩn bị EC2</a></li>
          <li><a href="#ce-pipeline"><span>03</span>Pipeline mẫu</a></li>
          <li><a href="#ce-rollback"><span>04</span>Health check và rollback</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">triển khai · ci/cd</div>
          <h1>CI/CD lên EC2</h1>
          <p className="lede">Push code là tự test, build image, đẩy lên registry rồi cập nhật container trên EC2.</p>
        </header>

        <section id="ce-flow">
          <h2><span className="n">01</span>Luồng tổng</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 250" role="img" aria-label="Dev push code; CI chạy test rồi build image, push lên ECR với tag là commit; CD vào EC2 qua SSH hoặc SSM, docker pull image mới, docker compose up -d, gọi health check; lỗi thì quay về tag cũ"> <defs><marker id="cea" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs> <rect className="s-box" x="16" y="40" width="130" height="58" rx="7" /><text className="s-tb" x="28" y="64">git push</text><text className="s-tm" x="28" y="84">nhánh main</text> <path className="s-ln" d="M146 69 H180" markerEnd="url(#cea)" /> <rect className="s-hl" x="182" y="24" width="300" height="90" rx="8" /><text className="s-tb" x="196" y="48">CI</text><text className="s-tm" x="196" y="70" style={{ fill: "var(--ink)" }}>1. cài thư viện, lint, test</text><text className="s-tm" x="196" y="88" style={{ fill: "var(--ink)" }}>2. docker build</text><text className="s-tm" x="196" y="106" style={{ fill: "var(--ink)" }}>   tag = commit SHA</text> <path className="s-ln" d="M482 69 H520" markerEnd="url(#cea)" /> <rect className="s-disk" x="522" y="40" width="150" height="58" rx="7" /><text className="s-tb" x="534" y="64">ECR</text><text className="s-tm" x="534" y="84">order-svc:a1b2c3d</text> <path className="s-ln" d="M672 69 H708" markerEnd="url(#cea)" /> <rect className="s-hl" x="710" y="24" width="174" height="90" rx="8" /><text className="s-tb" x="724" y="48">CD</text><text className="s-tm" x="724" y="70" style={{ fill: "var(--ink)" }}>vào EC2 qua</text><text className="s-tm" x="724" y="88" style={{ fill: "var(--ink)" }}>SSH hoặc SSM</text> <path className="s-ln" d="M797 114 V150" markerEnd="url(#cea)" /> <rect className="s-box" x="16" y="152" width="868" height="76" rx="8" /><text className="s-tb" x="30" y="176">EC2</text><text className="s-tm" x="30" y="198" style={{ fill: "var(--ink)" }}>docker pull order-svc:a1b2c3d → docker compose up -d → curl /health</text><text className="s-tm" x="30" y="216">health lỗi: chạy lại tag trước (rollback)</text> </svg>
            </div>
            <figcaption>CI chỉ tạo ra image; CD chỉ chọn image nào chạy trên server. Tag theo commit SHA để biết chính xác đang chạy code nào và quay lại được.</figcaption>
          </figure>
        </section>

        <section id="ce-prep">
          <h2><span className="n">02</span>Chuẩn bị EC2</h2>
          <div className="tbl">
            <table>
              <thead><tr><th>Việc</th><th>Ghi chú</th></tr></thead>
              <tbody>
                <tr><td>Cài Docker và docker compose</td><td>Một lần khi tạo máy (hoặc dùng AMI có sẵn).</td></tr>
                <tr><td>IAM role cho EC2</td><td>Quyền pull từ ECR; không lưu access key trên máy.</td></tr>
                <tr><td>Security group</td><td>Mở 80/443 cho người dùng; SSH chỉ mở cho IP của CI hoặc dùng SSM thay SSH.</td></tr>
                <tr><td>File compose và .env</td><td>Đặt sẵn trên máy; secret lấy từ SSM Parameter Store hoặc Secrets Manager, không commit.</td></tr>
                <tr><td>Secret của pipeline</td><td>AWS role (OIDC) hoặc key, host EC2, SSH key — lưu trong secret của CI.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="ce-pipeline">
          <h2><span className="n">03</span>Pipeline mẫu (GitHub Actions)</h2>
          <Code lang="yaml">{`on: { push: { branches: [main] } }
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions: { id-token: write, contents: read }
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test
      - uses: aws-actions/configure-aws-credentials@v4
        with: { role-to-assume: \${{ secrets.AWS_ROLE }}, aws-region: ap-southeast-1 }
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
          <p>Azure Pipelines hay GitLab CI cũng cùng các bước: test → build → push → vào EC2 → pull → up → health check.</p>
        </section>

        <section id="ce-rollback">
          <h2><span className="n">04</span>Health check và rollback</h2>
          <div className="tbl">
            <table>
              <thead><tr><th>Vấn đề</th><th>Cách xử lý</th></tr></thead>
              <tbody>
                <tr><td>Bản mới lỗi</td><td>Chạy lại <code>TAG=&lt;sha cũ&gt; docker compose up -d</code>; image cũ vẫn còn trên ECR.</td></tr>
                <tr><td>Bị gián đoạn khi đổi container</td><td>Chạy 2 container sau Nginx/ALB, đổi lần lượt; hoặc nhiều EC2 sau ALB và cập nhật từng máy.</td></tr>
                <tr><td>Không biết đang chạy bản nào</td><td>Tag image bằng commit SHA và trả SHA trong <code>/health</code>.</td></tr>
                <tr><td>Ổ đĩa đầy vì image cũ</td><td>Thêm <code>docker image prune -f</code> sau khi deploy thành công.</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

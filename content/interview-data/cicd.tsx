import { Flow } from "@/components/Flow";
import type { InterviewData } from "@/components/InterviewList";
import type { Locale } from "@/lib/notebook";

const CICD = "https://docs.github.com/en/actions/get-started/continuous-integration";
const CD = "https://docs.github.com/en/actions/get-started/continuous-deployment";
const WORKFLOW = "https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions";
const SECRETS = "https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions";
const CACHE = "https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/caching-dependencies-to-speed-up-workflows";
const MATRIX = "https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/running-variations-of-jobs-in-a-workflow";
const ENV = "https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/managing-environments-for-deployment";
const OIDC = "https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect";
const ARTIFACT = "https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/storing-and-sharing-data-from-a-workflow";
const CONCURRENCY = "https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/control-the-concurrency-of-workflows-and-jobs";
const K8S = "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-update-deployment";

export default function build(l: Locale): InterviewData {
  const t = (vi: string, en: string) => (l === "vi" ? vi : en);
  return {
    eyebrow: t("phỏng vấn · ci/cd", "interview · ci/cd"),
    title: t("Phỏng vấn CI/CD", "CI/CD interview"),
    lede: t(
      "Bấm vào câu hỏi để xem đáp án, ví dụ và sơ đồ. Ví dụ dùng GitHub Actions; nguồn là docs.github.com.",
      "Click a question to see the answer, an example and a diagram. Examples use GitHub Actions; the source is docs.github.com.",
    ),
    items: [
      {
        q: t("So sánh CI và CD?", "CI vs CD?"),
        a: [
          t(
            "CI (Continuous Integration, tích hợp liên tục): mỗi lần push hoặc mở PR, hệ thống tự build, lint và chạy test để phát hiện lỗi sớm. Mục tiêu là code trên nhánh chính luôn build được và đúng. CI trả lời câu hỏi \"code này có ổn không?\".",
            "CI (Continuous Integration): on every push or PR the system automatically builds, lints and runs tests to catch bugs early. The goal is that the main branch always builds and is correct. CI answers \"is this code OK?\".",
          ),
          t(
            "CD có hai nghĩa. Continuous Delivery (chuyển giao liên tục): mỗi bản đã qua CI được đóng gói và sẵn sàng deploy bất cứ lúc nào, nhưng lên production vẫn cần một người bấm duyệt. Continuous Deployment (triển khai liên tục): bỏ bước duyệt, qua hết kiểm tra là tự lên production. CD trả lời câu hỏi \"đưa code này tới người dùng thế nào?\".",
            "CD has two meanings. Continuous Delivery: every build that passes CI is packaged and ready to deploy at any time, but going to production still needs a human approval. Continuous Deployment: no approval step, anything that passes all checks goes to production automatically. CD answers \"how does this code reach users?\".",
          ),
          t(
            "Tóm lại: CI kết thúc ở một artifact đã được kiểm chứng (image, bundle). CD lấy đúng artifact đó đẩy qua staging rồi production. CD không có CI phía trước thì chỉ là deploy nhanh hơn những lỗi chưa được kiểm tra.",
            "In short: CI ends with a verified artifact (an image, a bundle). CD takes that same artifact through staging and then production. CD without CI in front just ships untested bugs faster.",
          ),
        ],
        diagram: <Flow id="cicdvs" label="CI and CD" steps={[
          { title: "Push / PR", sub: t("dev đẩy code", "dev pushes code") },
          { title: "CI", sub: "build · lint · test", hl: true },
          { title: "Artifact", sub: "image / bundle" },
          { title: "Staging", sub: t("CD: tự deploy", "CD: auto deploy") },
          { title: "Production", sub: t("Delivery: duyệt tay · Deployment: tự động", "Delivery: manual · Deployment: auto"), hl: true },
        ]} caption={t("CI dừng ở artifact đã kiểm chứng; CD đưa artifact tới người dùng.", "CI stops at a verified artifact; CD takes it to users.")} />,
        code: { lang: "markdown", src: t(
`|                | CI                         | Continuous Delivery         | Continuous Deployment      |
|----------------|----------------------------|-----------------------------|----------------------------|
| Chạy khi       | mỗi push / PR              | sau khi CI xanh             | sau khi CI xanh            |
| Việc chính     | build, lint, test          | đóng gói, deploy staging    | deploy thẳng production    |
| Lên production | không                      | người bấm duyệt             | tự động                    |
| Đầu ra         | báo xanh/đỏ + artifact     | bản sẵn sàng phát hành      | bản đang chạy cho user     |
| Cần có         | test tự động tốt           | môi trường staging giống prod | test + monitoring + rollback tốt |`,
`|                | CI                         | Continuous Delivery         | Continuous Deployment      |
|----------------|----------------------------|-----------------------------|----------------------------|
| Runs when      | every push / PR            | after CI is green           | after CI is green          |
| Main job       | build, lint, test          | package, deploy to staging  | deploy straight to prod    |
| To production  | no                         | a human approves            | automatic                  |
| Output         | green/red + artifact       | a release-ready build       | a build serving users      |
| Requires       | good automated tests       | staging that mirrors prod   | tests + monitoring + rollback |`) },
        href: CICD, label: "About continuous integration",
      },
      {
        q: t("Workflow, job, step, runner trong GitHub Actions?", "Workflow, job, step and runner in GitHub Actions?"),
        a: t(
          "Workflow là file YAML trong .github/workflows, chạy khi có sự kiện (push, pull_request, workflow_dispatch). Workflow gồm nhiều job; các job mặc định chạy song song, mỗi job trên một runner (máy ảo) riêng, muốn tuần tự thì dùng needs. Mỗi job gồm các step chạy lần lượt: lệnh shell (run) hoặc action có sẵn (uses).",
          "A workflow is a YAML file in .github/workflows, triggered by an event (push, pull_request, workflow_dispatch). It contains jobs; jobs run in parallel by default, each on its own runner (a VM), and needs makes them sequential. Each job has steps that run in order: shell commands (run) or ready-made actions (uses).",
        ),
        code: { lang: "yaml", src: `on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test
  deploy:
    needs: test          # ${t("chỉ chạy khi test xanh", "runs only after test is green")}
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh` },
        href: WORKFLOW, label: "Workflow syntax",
      },
      {
        q: t("Một pipeline CI/CD điển hình gồm những bước nào?", "What does a typical CI/CD pipeline contain?"),
        a: t(
          "Checkout, cài thư viện (có cache), lint và type-check, unit test, build artifact (Docker image), quét bảo mật, đẩy image lên registry, deploy staging, chạy smoke/e2e test, duyệt (nếu là delivery), deploy production, theo dõi và rollback nếu lỗi. Bước rẻ và nhanh đặt trước để fail sớm.",
          "Checkout, install dependencies (cached), lint and type-check, unit tests, build the artifact (a Docker image), security scan, push the image to a registry, deploy to staging, smoke/e2e tests, approval (for delivery), deploy to production, monitor and roll back on failure. Cheap, fast steps go first to fail early.",
        ),
        diagram: <Flow id="cipl" label="Pipeline" steps={[
          { title: "Lint", sub: t("vài giây", "seconds") },
          { title: "Test", sub: "unit" },
          { title: "Build", sub: "image", hl: true },
          { title: "Staging", sub: "e2e" },
          { title: "Prod", sub: t("theo dõi", "monitor") },
        ]} />,
        href: CICD, label: "About continuous integration",
      },
      {
        q: t("Vì sao \"build once, deploy many\"?", "Why \"build once, deploy many\"?"),
        a: t(
          "Build artifact một lần, gắn tag theo commit SHA, rồi dùng đúng artifact đó cho staging và production; chỉ cấu hình (biến môi trường) là khác. Nếu build lại cho từng môi trường thì thứ chạy trên production không phải thứ đã được test.",
          "Build the artifact once, tag it with the commit SHA, and deploy that same artifact to staging and production; only configuration (env vars) differs. Rebuilding per environment means what runs in production is not what was tested.",
        ),
        code: { lang: "bash", src: `docker build -t registry/order-svc:$GITHUB_SHA .
docker push registry/order-svc:$GITHUB_SHA
# staging ${t("và", "and")} production ${t("cùng kéo", "both pull")} order-svc:$GITHUB_SHA` },
        href: ARTIFACT, label: "Storing workflow data as artifacts",
      },
      {
        q: t("Lưu secret trong pipeline thế nào cho an toàn?", "How do you handle secrets in a pipeline safely?"),
        a: t(
          "Không commit secret vào repo. Đặt trong GitHub Secrets (theo repo hoặc theo environment), đọc qua ${{ secrets.NAME }}; log sẽ tự che giá trị. Tốt hơn nữa là dùng OIDC để lấy credential tạm thời từ AWS/GCP thay vì lưu access key lâu dài. Cấp quyền tối thiểu cho GITHUB_TOKEN bằng permissions.",
          "Never commit secrets. Store them in GitHub Secrets (per repo or per environment) and read them via ${{ secrets.NAME }}; logs mask the values. Better still, use OIDC to get short-lived credentials from AWS/GCP instead of storing long-lived access keys. Give GITHUB_TOKEN least privilege with permissions.",
        ),
        code: { lang: "yaml", src: `permissions:
  id-token: write   # ${t("cho OIDC", "for OIDC")}
  contents: read
steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789012:role/deploy
      aws-region: ap-southeast-1` },
        href: OIDC, label: "Security hardening with OIDC",
      },
      {
        q: t("Làm pipeline chạy nhanh hơn?", "How do you make a pipeline faster?"),
        a: t(
          "Cache thư viện (npm, Go modules) và Docker layer; chạy job độc lập song song; dùng matrix chia test; chỉ chạy job liên quan bằng paths filter; huỷ run cũ khi có push mới bằng concurrency; đặt bước nhanh (lint) trước để fail sớm.",
          "Cache dependencies (npm, Go modules) and Docker layers; run independent jobs in parallel; shard tests with a matrix; run only relevant jobs with paths filters; cancel stale runs on a new push with concurrency; put fast steps (lint) first to fail early.",
        ),
        code: { lang: "yaml", src: `concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true
jobs:
  test:
    strategy:
      matrix: { shard: [1, 2, 3, 4] }
    steps:
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npx jest --shard=\${{ matrix.shard }}/4` },
        href: CACHE, label: "Caching dependencies",
      },
      {
        q: t("Matrix build dùng để làm gì?", "What is a matrix build for?"),
        a: t(
          "Chạy cùng một job với nhiều tổ hợp tham số (phiên bản Node, hệ điều hành, shard test) song song mà không phải viết lặp YAML.",
          "Run the same job across combinations of parameters (Node versions, operating systems, test shards) in parallel without repeating YAML.",
        ),
        code: { lang: "yaml", src: `strategy:
  matrix:
    node: [20, 22]
    os: [ubuntu-latest, windows-latest]
runs-on: \${{ matrix.os }}   # ${t("4 job chạy song song", "4 jobs in parallel")}` },
        href: MATRIX, label: "Matrix strategy",
      },
      {
        q: t("Rolling, blue-green và canary khác nhau?", "Rolling vs blue-green vs canary?"),
        a: [
          t(
            "Rolling: thay dần từng instance cũ bằng instance mới; tốn ít tài nguyên nhưng có lúc hai phiên bản chạy song song. Blue-green: dựng đủ môi trường mới (green) bên cạnh môi trường cũ (blue), test xong thì chuyển toàn bộ traffic; rollback chỉ là chuyển lại, nhưng tốn gấp đôi tài nguyên.",
            "Rolling: replace old instances with new ones gradually; cheap but two versions run side by side for a while. Blue-green: stand up a full new environment (green) next to the old one (blue), test it, then switch all traffic; rollback is just switching back, but it costs double the resources.",
          ),
          t(
            "Canary: đưa một phần nhỏ traffic (ví dụ 5%) sang bản mới, theo dõi lỗi và độ trễ, ổn thì tăng dần. Phát hiện lỗi với ít người dùng bị ảnh hưởng nhất, nhưng cần monitoring tốt.",
            "Canary: send a small slice of traffic (say 5%) to the new version, watch errors and latency, and ramp up if healthy. It catches problems while affecting the fewest users, but needs good monitoring.",
          ),
        ],
        diagram: <Flow id="cican" label="Canary" steps={[
          { title: "5%", sub: "v2" },
          { title: t("theo dõi", "watch"), sub: t("lỗi, độ trễ", "errors, latency"), hl: true },
          { title: "50%", sub: "v2" },
          { title: "100%", sub: "v2" },
        ]} caption={t("Chỉ số xấu ở bước nào thì quay về v1.", "If metrics go bad at any step, go back to v1.")} />,
        href: K8S, label: "Kubernetes rolling update",
      },
      {
        q: t("Rollback khi deploy lỗi thế nào?", "How do you roll back a bad deploy?"),
        a: t(
          "Vì mỗi bản là một artifact có tag bất biến, rollback là deploy lại tag trước đó, không build lại. Migration database phải tương thích ngược (expand rồi mới contract) để bản cũ vẫn chạy được với schema mới. Feature flag cho phép tắt tính năng lỗi mà không cần deploy.",
          "Because every release is an artifact with an immutable tag, rollback means redeploying the previous tag, not rebuilding. Database migrations must be backward compatible (expand first, contract later) so the old version still runs on the new schema. Feature flags let you switch off a broken feature without deploying.",
        ),
        code: { lang: "bash", src: `# ${t("bản lỗi", "bad release")}: order-svc:9f3c2a1
kubectl set image deploy/order-svc app=registry/order-svc:4b7e0d2   # ${t("tag trước", "previous tag")}
# ${t("hoặc", "or")}
kubectl rollout undo deploy/order-svc` },
        href: K8S, label: "Kubernetes deployments",
      },
      {
        q: t("Chạy migration database trong pipeline ra sao?", "How do you run database migrations in a pipeline?"),
        a: t(
          "Chạy migration như một bước riêng trước khi bản mới nhận traffic, chỉ một tiến trình chạy (tránh nhiều pod cùng migrate). Dùng mô hình expand/contract: bước 1 thêm cột mới (bản cũ vẫn chạy), deploy code dùng cột mới, bước sau mới xoá cột cũ. Không bao giờ đổi tên hoặc xoá cột trong cùng lần deploy với code mới.",
          "Run migrations as a separate step before the new version takes traffic, from a single process (so multiple pods do not migrate at once). Use expand/contract: first add the new column (the old version still works), deploy code that uses it, and only later drop the old column. Never rename or drop a column in the same deploy as the new code.",
        ),
        diagram: <Flow id="cimg" label="Expand / contract" steps={[
          { title: "Expand", sub: t("thêm cột mới", "add new column") },
          { title: "Deploy", sub: t("code ghi cả hai", "code writes both"), hl: true },
          { title: "Backfill", sub: t("chép dữ liệu cũ", "copy old data") },
          { title: "Contract", sub: t("xoá cột cũ", "drop old column") },
        ]} />,
        href: CD, label: "About continuous deployment",
      },
      {
        q: t("Environment và approval trong GitHub Actions?", "Environments and approvals in GitHub Actions?"),
        a: t(
          "Environment (staging, production) gom secret riêng và luật bảo vệ: người duyệt bắt buộc, thời gian chờ, chỉ nhánh main được deploy. Job khai báo environment: production sẽ dừng chờ duyệt, đây chính là cách làm Continuous Delivery thay vì Deployment.",
          "An environment (staging, production) groups its own secrets and protection rules: required reviewers, a wait timer, only main may deploy. A job declaring environment: production pauses for approval; that is exactly how you do Continuous Delivery rather than Deployment.",
        ),
        code: { lang: "yaml", src: `deploy-prod:
  needs: deploy-staging
  environment: production   # ${t("dừng chờ người duyệt", "waits for a reviewer")}
  runs-on: ubuntu-latest
  steps:
    - run: ./deploy.sh prod` },
        href: ENV, label: "Managing environments",
      },
      {
        q: t("Hai lần push liên tiếp cùng deploy thì sao?", "What if two pushes deploy at the same time?"),
        a: t(
          "Hai run có thể ghi đè nhau, bản cũ hơn xong sau và đè bản mới. Dùng concurrency với cùng group để chỉ một deploy chạy một lúc; cancel-in-progress: true hợp cho CI, còn deploy production thường để false để không cắt ngang giữa chừng.",
          "Two runs can race, and the older one may finish last and overwrite the newer one. Use concurrency with a shared group so only one deploy runs at a time; cancel-in-progress: true suits CI, while production deploys usually keep it false so nothing is cut off midway.",
        ),
        code: { lang: "yaml", src: `concurrency:
  group: deploy-production
  cancel-in-progress: false` },
        href: CONCURRENCY, label: "Control concurrency",
      },
    ],
  };
}

import { Flow } from "@/components/Flow";
import type { InterviewData } from "@/components/InterviewList";
import type { Locale } from "@/lib/notebook";

const CONTAINER = "https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/";
const IMAGE = "https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/";
const VOLUMES = "https://docs.docker.com/engine/storage/volumes/";
const BIND = "https://docs.docker.com/engine/storage/bind-mounts/";
const DOCKERFILE = "https://docs.docker.com/reference/dockerfile/";
const MULTI = "https://docs.docker.com/build/building/multi-stage/";
const CACHE = "https://docs.docker.com/build/cache/";
const NETWORK = "https://docs.docker.com/engine/network/";
const LIMITS = "https://docs.docker.com/engine/containers/resource_constraints/";
const REGISTRY = "https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-registry/";
const COMPOSE = "https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-docker-compose/";

export default function build(l: Locale): InterviewData {
  const t = (vi: string, en: string) => (l === "vi" ? vi : en);
  return {
    eyebrow: t("phỏng vấn · docker", "interview · docker"),
    title: t("Phỏng vấn Docker", "Docker interview"),
    lede: t(
      "Bấm vào câu hỏi để xem đáp án, ví dụ và sơ đồ. Nguồn là docs.docker.com.",
      "Click a question to see the answer, an example and a diagram. The source is docs.docker.com.",
    ),
    items: [
      {
        q: t("Image khác container?", "Image vs container?"),
        a: t(
          "Image là gói chỉ đọc chứa code, thư viện, cấu hình. Container là image đang chạy cộng một lớp ghi tạm. Image giống class, container giống object: từ một image chạy được nhiều container.",
          "An image is a read-only package of code, libraries and settings. A container is a running image plus a temporary writable layer. An image is like a class, a container like an object: one image can run many containers.",
        ),
        diagram: <Flow id="dkic" label="Dockerfile, image, container" steps={[
          { title: "Dockerfile", sub: t("công thức build", "build recipe") },
          { title: "Image", sub: t("chỉ đọc", "read-only"), hl: true },
          { title: "Container", sub: t("đang chạy", "running") },
        ]} caption={t("docker build tạo image; docker run tạo container từ image.", "docker build creates the image; docker run creates a container from it.")} />,
        code: { lang: "bash", src: `docker build -t order-svc:1.4.0 .
docker run -d --name order-1 order-svc:1.4.0
docker run -d --name order-2 order-svc:1.4.0   # ${t("cùng image, hai container", "same image, two containers")}` },
        href: CONTAINER, label: "What is a container",
      },
      {
        q: t("Container khác VM (Virtual Machine)?", "Container vs VM (Virtual Machine)?"),
        a: t(
          "Container dùng chung kernel với host, chỉ cô lập tiến trình, nên nhẹ và khởi động nhanh. VM chạy cả hệ điều hành riêng trên hypervisor.",
          "A container shares the host kernel and only isolates processes, so it is light and starts fast. A VM runs a full operating system of its own on a hypervisor.",
        ),
        href: CONTAINER, label: "What is a container",
      },
      {
        q: t("Image gồm những gì? Layer là gì?", "What is in an image? What is a layer?"),
        a: t(
          "Image là chồng các layer, mỗi layer ghi lại phần file thêm, xoá, sửa. Layer giống nhau được dùng chung giữa các image.",
          "An image is a stack of layers; each layer records file additions, deletions or edits. Identical layers are shared between images.",
        ),
        code: { lang: "dockerfile", src: `FROM node:22-alpine      # ${t("layer 1: hệ điều hành + Node", "layer 1: OS + Node")}
WORKDIR /app             # ${t("layer 2", "layer 2")}
COPY package*.json ./    # ${t("layer 3: file khai báo thư viện", "layer 3: dependency manifests")}
RUN npm ci               # ${t("layer 4: node_modules", "layer 4: node_modules")}
COPY . .                 # ${t("layer 5: code app", "layer 5: app code")}` },
        href: IMAGE, label: "What is an image",
      },
      {
        q: t("Xoá container thì dữ liệu có mất không?", "Is data lost when a container is removed?"),
        a: t(
          "Dữ liệu ghi trong lớp ghi tạm của container thì mất. Dữ liệu nằm trong volume vẫn còn.",
          "Data written to the container's writable layer is lost. Data in a volume stays.",
        ),
        code: { lang: "bash", src: `docker run -d --name db -v pgdata:/var/lib/postgresql/data postgres:16
docker rm -f db                       # ${t("container mất", "the container is gone")}
docker run -d --name db2 -v pgdata:/var/lib/postgresql/data postgres:16   # ${t("dữ liệu vẫn còn", "the data is still there")}` },
        href: VOLUMES, label: "Volumes",
      },
      {
        q: t("Volume khác bind mount?", "Volume vs bind mount?"),
        a: t(
          "Volume do Docker tạo và quản lý trong vùng lưu trữ của nó. Bind mount trỏ thẳng vào một thư mục có sẵn trên host, hay dùng để mount code lúc phát triển.",
          "A volume is created and managed by Docker in its own storage area. A bind mount points at an existing host directory, often used to mount source code in development.",
        ),
        code: { lang: "bash", src: `docker run -v pgdata:/data  alpine ls /data         # volume (${t("tên", "named")})
docker run -v "$PWD":/app   alpine ls /app          # bind mount (${t("đường dẫn trên host", "host path")})` },
        href: BIND, label: "Bind mounts",
      },
      {
        q: t("CMD khác ENTRYPOINT?", "CMD vs ENTRYPOINT?"),
        a: t(
          "ENTRYPOINT là chương trình container chạy. CMD là tham số hoặc lệnh mặc định, bị thay khi truyền đối số lúc docker run.",
          "ENTRYPOINT is the executable the container runs. CMD is the default arguments or command, replaced when you pass arguments to docker run.",
        ),
        code: { lang: "dockerfile", src: `ENTRYPOINT ["node", "dist/start.js"]
CMD ["--port", "3000"]

# docker run app                 -> node dist/start.js --port 3000
# docker run app --port 8080     -> node dist/start.js --port 8080   (${t("CMD bị thay", "CMD replaced")})` },
        href: DOCKERFILE, label: "Dockerfile reference",
      },
      {
        q: t("COPY khác ADD?", "COPY vs ADD?"),
        a: t(
          "COPY chỉ chép file từ build context hoặc stage khác. ADD còn tải được URL (Uniform Resource Locator), clone Git và tự giải nén tar. Ưu tiên COPY cho rõ ràng.",
          "COPY only copies files from the build context or another stage. ADD can also fetch URLs (Uniform Resource Locator), clone Git repositories and auto-extract tar files. Prefer COPY for clarity.",
        ),
        code: { lang: "dockerfile", src: `COPY src/ /app/src/                 # ${t("nên dùng", "preferred")}
ADD  rootfs.tar.gz /                # ${t("tự giải nén: chỉ ADD làm được", "auto-extracts: only ADD does this")}` },
        href: DOCKERFILE, label: "Dockerfile reference",
      },
      {
        q: t("Multi-stage build để làm gì?", "What is a multi-stage build for?"),
        a: t(
          "Dùng nhiều FROM trong một Dockerfile, chỉ chép kết quả build sang image cuối. Image nhỏ hơn, không mang theo công cụ build.",
          "Several FROM statements in one Dockerfile, copying only the build output into the final image. The image is smaller and carries no build tools.",
        ),
        diagram: <Flow id="dkms" label="Multi-stage" steps={[
          { title: "Stage build", sub: t("đủ công cụ", "full toolchain") },
          { title: "COPY --from", sub: t("chỉ chép kết quả", "output only"), hl: true },
          { title: "Image cuối", sub: t("nhỏ, chạy production", "small, for production") },
        ]} />,
        code: { lang: "dockerfile", src: `FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist     # ${t("chỉ lấy kết quả build", "take only the build output")}
CMD ["node", "dist/start.js"]` },
        href: MULTI, label: "Multi-stage builds",
      },
      {
        q: t("Làm sao build nhanh hơn?", "How do you make builds faster?"),
        a: t(
          "Xếp lệnh ít đổi lên trên (chép package*.json, cài thư viện rồi mới chép code). Một layer đổi thì mọi layer sau phải build lại.",
          "Put rarely changing steps first (copy package*.json and install dependencies before copying code). When one layer changes, every later layer rebuilds.",
        ),
        code: { lang: "dockerfile", src: `# ${t("Tốt: sửa code không làm mất cache của npm ci", "Good: editing code keeps the npm ci cache")}
COPY package*.json ./
RUN npm ci
COPY . .

# ${t("Tệ: mỗi lần sửa code là cài lại toàn bộ thư viện", "Bad: every code edit reinstalls all dependencies")}
# COPY . .
# RUN npm ci` },
        href: CACHE, label: "Build cache",
      },
      {
        q: t("Hai container gọi nhau thế nào?", "How do two containers reach each other?"),
        a: t(
          "Đặt chung một network tự tạo (Compose làm sẵn) rồi gọi bằng tên service qua DNS (Domain Name System) nhúng của Docker. Bridge mặc định chỉ gọi được bằng IP.",
          "Put them on the same user-defined network (Compose does this for you) and call the service name through Docker's embedded DNS (Domain Name System). On the default bridge they can only use IP addresses.",
        ),
        code: { lang: "bash", src: `docker network create appnet
docker run -d --name mongo --network appnet mongo:7
docker run -d --name app   --network appnet -e MONGO_URL=mongodb://mongo:27017 order-svc
#                                                    ^ ${t("tên container làm hostname", "container name works as hostname")}` },
        href: NETWORK, label: "Networking",
      },
      {
        q: t("Cổng -p 8080:80 nghĩa là gì?", "What does -p 8080:80 mean?"),
        a: t(
          "Publish: cổng 8080 trên host chuyển vào cổng 80 trong container. Không publish thì chỉ truy cập được từ trong mạng của host.",
          "Publish: host port 8080 is forwarded to port 80 inside the container. Without publishing, the port is reachable only inside the host network.",
        ),
        diagram: <Flow id="dkpp" label="Port publish" steps={[
          { title: t("Trình duyệt", "Browser"), sub: "localhost:8080" },
          { title: "Host", sub: t("cổng 8080", "port 8080"), hl: true },
          { title: "Container", sub: t("cổng 80", "port 80") },
        ]} />,
        code: { lang: "bash", src: `docker run -d -p 8080:80 nginx
curl http://localhost:8080          # ${t("tới nginx trong container", "reaches nginx in the container")}` },
        href: NETWORK, label: "Networking",
      },
      {
        q: t("Một container chiếm hết RAM thì sao?", "What if one container eats all the RAM?"),
        a: t(
          "Đặt giới hạn bằng -m, --cpus. Vượt giới hạn RAM thì kernel OOM (Out Of Memory) killer giết tiến trình trong container đó, daemon vẫn an toàn.",
          "Set limits with -m and --cpus. Past the memory limit, the kernel OOM (Out Of Memory) killer ends processes in that container while the daemon stays safe.",
        ),
        code: { lang: "bash", src: `docker run -d -m 512m --cpus 1.5 order-svc:1.4.0
docker stats                         # ${t("xem mức dùng thực tế", "watch real usage")}` },
        href: LIMITS, label: "Resource constraints",
      },
      {
        q: t("Registry là gì? Tag dùng thế nào?", "What is a registry? How are tags used?"),
        a: t(
          "Registry lưu và chia sẻ image, mặc định là Docker Hub. Repository gom các image của một dự án, mỗi phiên bản một tag. Production nên pin tag cụ thể thay vì latest.",
          "A registry stores and shares images; Docker Hub is the default. A repository groups one project's images, one tag per version. In production, pin a specific tag instead of latest.",
        ),
        code: { lang: "bash", src: `docker tag order-svc:1.4.0 registry.example.com/team/order-svc:1.4.0
docker push registry.example.com/team/order-svc:1.4.0
docker pull registry.example.com/team/order-svc:1.4.0    # ${t("máy khác", "another machine")}` },
        href: REGISTRY, label: "What is a registry",
      },
      {
        q: t("Docker Compose dùng khi nào?", "When do you use Docker Compose?"),
        a: t(
          "Khi chạy nhiều container cùng nhau (app, database, cache). Khai báo trong compose.yaml, chạy bằng một lệnh, rerun chỉ áp dụng phần thay đổi.",
          "When several containers run together (app, database, cache). Declare them in compose.yaml and start with one command; rerunning applies only the changes.",
        ),
        code: [
          { lang: "yaml", src: `services:
  app:
    image: order-svc:1.4.0
    ports: ["3000:3000"]
    depends_on: [mongo]
  mongo:
    image: mongo:7
    volumes: [mongo-data:/data/db]
volumes:
  mongo-data:` },
          { lang: "bash", src: `docker compose up -d      # ${t("chạy cả cụm", "start everything")}
docker compose down       # ${t("dừng và xoá container (volume giữ lại)", "stop and remove containers (volumes stay)")}` },
        ],
        href: COMPOSE, label: "What is Docker Compose",
      },
    ],
  };
}

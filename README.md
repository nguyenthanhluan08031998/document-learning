# Sổ tay Backend

Ghi chú học backend bằng tiếng Việt, viết bằng **Next.js (App Router) + TypeScript**, xuất ra site tĩnh.

| Nhóm | Nội dung |
|---|---|
| API (đồng bộ) | REST, GraphQL, gRPC, so sánh |
| Messaging (bất đồng bộ) | Kafka, RabbitMQ, NATS, so sánh |
| Thiết kế | OOP, SOLID, 23 pattern GoF, pattern microservice, Clean Architecture, tra nhanh |
| Đồng thời | Race condition, isolation level, pessimistic/optimistic lock, SKIP LOCKED, distributed lock |
| Vận hành | Logging, structured logging, tự viết logger, observability |

## Chạy trên máy

```bash
npm install
npm run dev          # http://localhost:3000
```

## Build

```bash
npm run build        # site tĩnh nằm trong ./out
npm start            # xem thử bản build
```

## Cấu trúc

```
app/
  layout.tsx                 # khung trang, header, font
  page.tsx                   # trang Tổng quan  (/)
  [group]/[slug]/page.tsx    # mọi trang con     (/api/rest/, /messaging/kafka/, ...)
  notebook.css               # giao diện chung, sơ đồ
  globals.css                # phần riêng cho Next.js
components/
  NotebookHeader.tsx         # thanh nhóm + tab con (client component)
  Code.tsx                   # khối code, tô màu lúc build bằng Shiki (One Dark)
lib/
  notebook.ts                # danh sách nhóm, trang, route
content/
  home.tsx                   # nội dung trang Tổng quan
  <nhóm>/<slug>.tsx          # nội dung từng trang: chữ, sơ đồ SVG, code
  index.ts                   # map "nhóm/slug" → component
```

### Thêm hoặc sửa một trang

1. Sửa hoặc tạo file `content/<nhóm>/<slug>.tsx`.
2. Nếu là trang mới, khai báo trong `lib/notebook.ts` và `content/index.ts`.
3. Link sang trang khác dùng `<Link href="/design/oop/#oop-static">` (base path được thêm tự động).
4. Code mẫu viết trong `<Code lang="ts">{`...`}</Code>`.

## Deploy lên GitHub Pages

Repo đã có sẵn workflow `.github/workflows/deploy.yml`. Vào **Settings → Pages → Source: GitHub Actions**, sau đó mỗi lần push lên `main` site sẽ tự build và đăng tại `https://<user>.github.io/<tên-repo>/`.

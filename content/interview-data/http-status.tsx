import type { InterviewData } from "@/components/InterviewList";
import type { Locale } from "@/lib/notebook";

const STATUS = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status";

export default function build(l: Locale): InterviewData {
  const t = (vi: string, en: string) => (l === "vi" ? vi : en);
  return {
    eyebrow: t("phỏng vấn · http status code", "interview · http status codes"),
    title: t("Phỏng vấn HTTP status code", "HTTP status code interview"),
    lede: t(
      "Bấm vào câu hỏi để xem bảng các mã thường gặp. Nguồn là MDN.",
      "Click the question to see the table of common codes. The source is MDN.",
    ),
    items: [
      {
        q: t("Các HTTP status code thường gặp là gì?", "What are the common HTTP status codes?"),
        a: [
          t(
            "1xx: thông tin. 2xx: thành công. 3xx: chuyển hướng. 4xx: lỗi phía client (gửi lại y hệt vẫn sai). 5xx: lỗi phía server (thử lại sau có thể được).",
            "1xx: informational. 2xx: success. 3xx: redirection. 4xx: client error (resending the same request fails again). 5xx: server error (a later retry may work).",
          ),
          t(
            "Cặp hay bị hỏi: 401 là chưa đăng nhập / token sai, 403 là đã đăng nhập nhưng không có quyền. 502 là server phía sau trả lỗi cho gateway, 504 là server phía sau trả lời quá chậm.",
            "Commonly asked pairs: 401 means not logged in / bad token, 403 means logged in but not allowed. 502 means the upstream returned a bad response to the gateway, 504 means the upstream answered too slowly.",
          ),
        ],
        code: { lang: "markdown", src: t(
`| Mã  | Tên                   | Nghĩa / dùng khi                                                    |
|-----|-----------------------|---------------------------------------------------------------------|
| 101 | Switching Protocols   | chuyển giao thức, ví dụ nâng cấp lên WebSocket                      |
| 200 | OK                    | thành công, có dữ liệu trả về (GET, PUT, PATCH)                     |
| 201 | Created               | POST tạo mới thành công, kèm header Location                        |
| 202 | Accepted              | đã nhận, sẽ xử lý sau (bất đồng bộ: xuất báo cáo, gửi email)        |
| 204 | No Content            | thành công, không có body (DELETE)                                  |
| 301 | Moved Permanently     | đổi URL vĩnh viễn                                                   |
| 302 | Found                 | chuyển hướng tạm thời                                               |
| 304 | Not Modified          | dữ liệu chưa đổi, dùng bản cache (ETag)                             |
| 307 | Temporary Redirect    | chuyển hướng tạm thời, giữ nguyên method và body                    |
| 308 | Permanent Redirect    | chuyển hướng vĩnh viễn, giữ nguyên method và body                   |
| 400 | Bad Request           | request sai: JSON hỏng, sai kiểu dữ liệu, thiếu tham số             |
| 401 | Unauthorized          | chưa đăng nhập, token sai hoặc hết hạn                              |
| 403 | Forbidden             | đã đăng nhập nhưng không có quyền                                   |
| 404 | Not Found             | không tìm thấy tài nguyên                                           |
| 405 | Method Not Allowed    | sai method, ví dụ gọi DELETE vào API chỉ hỗ trợ GET                 |
| 408 | Request Timeout       | client gửi request quá chậm                                         |
| 409 | Conflict              | xung đột dữ liệu: email đã tồn tại, huỷ đơn đã giao                 |
| 413 | Content Too Large     | body quá lớn (upload file vượt giới hạn)                            |
| 415 | Unsupported Media Type| sai Content-Type, ví dụ API cần JSON mà gửi form                    |
| 422 | Unprocessable Content | đúng cú pháp nhưng sai dữ liệu nghiệp vụ (validation)               |
| 429 | Too Many Requests     | gọi quá nhiều, vượt rate limit (kèm Retry-After)                    |
| 500 | Internal Server Error | lỗi trong code server                                               |
| 502 | Bad Gateway           | gateway/proxy nhận phản hồi lỗi từ server phía sau                  |
| 503 | Service Unavailable   | server quá tải hoặc đang bảo trì                                    |
| 504 | Gateway Timeout       | gateway chờ server phía sau quá lâu                                 |`,
`| Code | Name                  | Meaning / use when                                                 |
|------|-----------------------|--------------------------------------------------------------------|
| 101  | Switching Protocols   | switching protocols, e.g. upgrading to WebSocket                   |
| 200  | OK                    | success with data (GET, PUT, PATCH)                                |
| 201  | Created               | POST created a resource, with a Location header                    |
| 202  | Accepted              | accepted, processed later (async: reports, emails)                 |
| 204  | No Content            | success, no body (DELETE)                                          |
| 301  | Moved Permanently     | URL changed for good                                               |
| 302  | Found                 | temporary redirect                                                 |
| 304  | Not Modified          | unchanged, use the cached copy (ETag)                              |
| 307  | Temporary Redirect    | temporary redirect, keeps method and body                          |
| 308  | Permanent Redirect    | permanent redirect, keeps method and body                          |
| 400  | Bad Request           | bad request: broken JSON, wrong types, missing params              |
| 401  | Unauthorized          | not logged in, bad or expired token                                |
| 403  | Forbidden             | logged in but not allowed                                          |
| 404  | Not Found             | resource not found                                                 |
| 405  | Method Not Allowed    | wrong method, e.g. DELETE on a GET-only endpoint                   |
| 408  | Request Timeout       | the client sent the request too slowly                             |
| 409  | Conflict              | data conflict: email already exists, cancelling a shipped order    |
| 413  | Content Too Large     | body too large (upload over the limit)                             |
| 415  | Unsupported Media Type| wrong Content-Type, e.g. form data sent to a JSON API              |
| 422  | Unprocessable Content | valid syntax but fails business validation                         |
| 429  | Too Many Requests     | rate limit exceeded (with Retry-After)                             |
| 500  | Internal Server Error | a bug in the server code                                           |
| 502  | Bad Gateway           | gateway/proxy got a bad response from upstream                     |
| 503  | Service Unavailable   | server overloaded or under maintenance                             |
| 504  | Gateway Timeout       | gateway waited too long for upstream                               |`) },
        href: STATUS, label: "HTTP response status codes (MDN)",
      },
    ],
  };
}

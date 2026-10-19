import Link from "next/link";

type Cmd = [command: string, meaning: string];

const SECTIONS: { id: string; title: string; cmds: Cmd[] }[] = [
  {
    id: "gc-setup", title: "Cài đặt và khởi tạo", cmds: [
      ["git config --global user.name \"Tên\"", "Đặt tên tác giả cho mọi commit"],
      ["git config --global user.email \"a@b.com\"", "Đặt email tác giả"],
      ["git init", "Biến thư mục hiện tại thành repo Git"],
      ["git clone <url>", "Tải một repo từ remote về máy"],
    ],
  },
  {
    id: "gc-daily", title: "Làm việc hằng ngày", cmds: [
      ["git status", "Xem file nào đã sửa, đã add, chưa theo dõi"],
      ["git diff", "Xem thay đổi chưa add"],
      ["git diff --staged", "Xem thay đổi đã add, sắp commit"],
      ["git add <file>", "Đưa file vào vùng chờ commit (staging)"],
      ["git add -p", "Chọn từng đoạn thay đổi để add"],
      ["git commit -m \"msg\"", "Tạo commit từ những gì đã add"],
      ["git commit --amend", "Sửa commit cuối (message hoặc thêm file); chỉ dùng khi chưa push"],
    ],
  },
  {
    id: "gc-branch", title: "Nhánh", cmds: [
      ["git branch", "Liệt kê nhánh local; -a để xem cả nhánh remote"],
      ["git switch -c <nhánh>", "Tạo nhánh mới và chuyển sang"],
      ["git switch <nhánh>", "Chuyển sang nhánh có sẵn"],
      ["git branch -d <nhánh>", "Xoá nhánh đã merge; -D để xoá bắt buộc"],
      ["git merge <nhánh>", "Gộp nhánh kia vào nhánh hiện tại"],
      ["git rebase <nhánh>", "Đặt các commit của nhánh hiện tại lên đầu nhánh kia"],
      ["git cherry-pick <hash>", "Chép một commit cụ thể sang nhánh hiện tại"],
    ],
  },
  {
    id: "gc-remote", title: "Làm việc với remote", cmds: [
      ["git remote -v", "Xem remote đang trỏ tới đâu"],
      ["git fetch", "Tải commit mới từ remote, chưa gộp vào nhánh của bạn"],
      ["git pull", "fetch rồi merge vào nhánh hiện tại"],
      ["git pull --rebase", "fetch rồi rebase, không tạo merge commit"],
      ["git push -u origin <nhánh>", "Đẩy nhánh lên remote lần đầu và ghi nhớ liên kết"],
      ["git push", "Đẩy commit mới lên remote"],
      ["git push --force-with-lease", "Đẩy đè sau khi rebase; từ chối nếu remote có commit bạn chưa thấy"],
    ],
  },
  {
    id: "gc-history", title: "Xem lịch sử", cmds: [
      ["git log --oneline --graph", "Lịch sử gọn, có vẽ nhánh"],
      ["git show <hash>", "Xem nội dung một commit"],
      ["git blame <file>", "Xem từng dòng do ai sửa, ở commit nào"],
      ["git reflog", "Mọi vị trí HEAD từng đi qua; dùng để cứu commit lỡ xoá"],
    ],
  },
  {
    id: "gc-undo", title: "Hoàn tác", cmds: [
      ["git restore <file>", "Bỏ thay đổi chưa add của file"],
      ["git restore --staged <file>", "Bỏ add, giữ nguyên thay đổi"],
      ["git reset --soft HEAD~1", "Huỷ commit cuối, giữ thay đổi ở trạng thái đã add"],
      ["git reset --hard HEAD~1", "Huỷ commit cuối và xoá luôn thay đổi (nguy hiểm)"],
      ["git revert <hash>", "Tạo commit mới đảo ngược một commit; an toàn cho nhánh đã push"],
    ],
  },
  {
    id: "gc-stash", title: "Cất tạm và tag", cmds: [
      ["git stash", "Cất tạm thay đổi đang làm để chuyển nhánh"],
      ["git stash pop", "Lấy lại thay đổi vừa cất"],
      ["git stash list", "Xem các lần đã cất"],
      ["git tag v1.4.0", "Gắn nhãn phiên bản cho commit hiện tại"],
      ["git push --tags", "Đẩy tag lên remote"],
    ],
  },
];

export default function GitOverviewPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục lệnh Git">
        <div className="label">Mục lục</div>
        <ol>
          {SECTIONS.map((s, i) => (
            <li key={s.id}><a href={`#${s.id}`}><span>{String(i + 1).padStart(2, "0")}</span>{s.title}</a></li>
          ))}
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">git · tổng quan</div>
          <h1>Lệnh Git hay dùng</h1>
          <p className="lede">Các lệnh dùng hằng ngày, xếp theo việc cần làm. Mô hình chia nhánh xem ở <Link className="plink" href="/git/workflow/">Branching workflow</Link>, cách gộp nhánh xem ở <Link className="plink" href="/git/merge-rebase/">Merge vs Rebase</Link>.</p>
        </header>
        {SECTIONS.map((s, i) => (
          <section key={s.id} id={s.id}>
            <h2><span className="n">{String(i + 1).padStart(2, "0")}</span>{s.title}</h2>
            <div className="tbl">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "40%" }}>Lệnh</th>
                    <th>Ý nghĩa</th>
                  </tr>
                </thead>
                <tbody>
                  {s.cmds.map(([cmd, meaning]) => (
                    <tr key={cmd}>
                      <td className="m">{cmd}</td>
                      <td>{meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

import Link from "next/link";

type Cmd = [command: string, meaning: string];

const SECTIONS: { id: string; title: string; cmds: Cmd[] }[] = [
  {
    id: "gc-setup", title: "Setup and init", cmds: [
      ["git config --global user.name \"Name\"", "Set the author name for every commit"],
      ["git config --global user.email \"a@b.com\"", "Set the author email"],
      ["git init", "Turn the current folder into a Git repo"],
      ["git clone <url>", "Download a repo from a remote"],
    ],
  },
  {
    id: "gc-daily", title: "Everyday work", cmds: [
      ["git status", "See which files are modified, staged, untracked"],
      ["git diff", "See unstaged changes"],
      ["git diff --staged", "See staged changes about to be committed"],
      ["git add <file>", "Put a file in the staging area"],
      ["git add -p", "Choose hunks to stage one by one"],
      ["git commit -m \"msg\"", "Commit what is staged"],
      ["git commit --amend", "Edit the last commit (message or add files); only before pushing"],
    ],
  },
  {
    id: "gc-branch", title: "Branches", cmds: [
      ["git branch", "List local branches; -a to include remote ones"],
      ["git switch -c <branch>", "Create a new branch and switch to it"],
      ["git switch <branch>", "Switch to an existing branch"],
      ["git branch -d <branch>", "Delete a merged branch; -D to force"],
      ["git merge <branch>", "Merge another branch into the current one"],
      ["git rebase <branch>", "Replay the current branch's commits on top of another branch"],
      ["git cherry-pick <hash>", "Copy one specific commit onto the current branch"],
    ],
  },
  {
    id: "gc-remote", title: "Working with remotes", cmds: [
      ["git remote -v", "See where remotes point"],
      ["git fetch", "Download new commits from the remote without merging"],
      ["git pull", "fetch, then merge into the current branch"],
      ["git pull --rebase", "fetch, then rebase, without a merge commit"],
      ["git push -u origin <branch>", "Push a branch the first time and remember the link"],
      ["git push", "Push new commits to the remote"],
      ["git push --force-with-lease", "Force-push after a rebase; refuses if the remote has commits you haven't seen"],
    ],
  },
  {
    id: "gc-history", title: "History", cmds: [
      ["git log --oneline --graph", "Compact history with branch graph"],
      ["git show <hash>", "Show the contents of a commit"],
      ["git blame <file>", "See who changed each line, in which commit"],
      ["git reflog", "Every position HEAD has been at; rescues lost commits"],
    ],
  },
  {
    id: "gc-undo", title: "Undo", cmds: [
      ["git restore <file>", "Discard unstaged changes to a file"],
      ["git restore --staged <file>", "Unstage, keeping the changes"],
      ["git reset --soft HEAD~1", "Undo the last commit, keeping changes staged"],
      ["git reset --hard HEAD~1", "Undo the last commit and discard its changes (dangerous)"],
      ["git revert <hash>", "Create a new commit that reverses one; safe on pushed branches"],
    ],
  },
  {
    id: "gc-stash", title: "Stash and tags", cmds: [
      ["git stash", "Shelve work in progress to switch branches"],
      ["git stash pop", "Bring back the last stashed changes"],
      ["git stash list", "List stashes"],
      ["git tag v1.4.0", "Tag the current commit with a version"],
      ["git push --tags", "Push tags to the remote"],
    ],
  },
];

export default function GitOverviewPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Git commands contents">
        <div className="label">Contents</div>
        <ol>
          {SECTIONS.map((s, i) => (
            <li key={s.id}><a href={`#${s.id}`}><span>{String(i + 1).padStart(2, "0")}</span>{s.title}</a></li>
          ))}
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">git · overview</div>
          <h1>Everyday Git commands</h1>
          <p className="lede">The commands you use every day, grouped by task. For branching models see <Link className="plink" href="/en/git/workflow/">Branching workflow</Link>; for combining branches see <Link className="plink" href="/en/git/merge-rebase/">Merge vs Rebase</Link>.</p>
        </header>
        {SECTIONS.map((s, i) => (
          <section key={s.id} id={s.id}>
            <h2><span className="n">{String(i + 1).padStart(2, "0")}</span>{s.title}</h2>
            <div className="tbl">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "40%" }}>Command</th>
                    <th>Meaning</th>
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

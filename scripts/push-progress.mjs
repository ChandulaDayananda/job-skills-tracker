// Commits public/progress.json (if it changed) and pushes it. Usage: npm run progress:push
import { execFileSync } from "node:child_process";

const git = (...args) => execFileSync("git", args, { stdio: "inherit" });
const quiet = (...args) => execFileSync("git", args, { encoding: "utf8" });

git("add", "public/progress.json");
if (quiet("diff", "--cached", "--name-only", "--", "public/progress.json").trim() === "") {
  console.log("Progress is already up to date. Nothing to push.");
  process.exit(0);
}
git("commit", "-m", "Update skills progress", "--", "public/progress.json");
git("push");
console.log("Progress pushed.");

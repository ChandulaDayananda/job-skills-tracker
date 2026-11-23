import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const PROGRESS_FILE = fileURLToPath(new URL("./public/progress.json", import.meta.url));

/**
 * Dev-server only: the app POSTs your progress here and it is written to public/progress.json,
 * so your ticks end up as a normal file change you can commit (see `npm run progress:push`).
 * Not part of the production build, so the deployed site never writes anything.
 */
function saveProgress(): Plugin {
  return {
    name: "save-progress",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__save-progress", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          try {
            const input = JSON.parse(body) as Record<string, { done?: unknown; note?: unknown; at?: unknown }>;
            if (typeof input !== "object" || input === null || Array.isArray(input)) throw new Error("bad shape");
            const clean: Record<string, { done: boolean; note: string; at: number }> = {};
            for (const id of Object.keys(input).sort()) {
              const p = input[id];
              clean[id] = {
                done: p.done === true,
                note: typeof p.note === "string" ? p.note : "",
                at: typeof p.at === "number" ? p.at : 0,
              };
            }
            writeFileSync(PROGRESS_FILE, JSON.stringify(clean, null, 2) + "\n");
            res.statusCode = 204;
          } catch {
            res.statusCode = 400;
          }
          res.end();
        });
      });
    },
  };
}

// base "./" lets the build work on GitHub Pages under any repo name.
export default defineConfig({
  base: "./",
  plugins: [react(), saveProgress()],
});

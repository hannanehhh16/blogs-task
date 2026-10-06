import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const posts = JSON.parse(
  fs.readFileSync(path.join(dir, "posts.json"), "utf8"),
);
const users = JSON.parse(
  fs.readFileSync(path.join(dir, "users.json"), "utf8"),
);

export const FIXTURE_PORT = Number(process.env.FIXTURE_PORT || 4017);

export function startFixtureServer(port = FIXTURE_PORT) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (url.pathname === "/health") {
      res.writeHead(200);
      res.end("ok");
      return;
    }

    if (url.pathname === "/posts") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(posts));
      return;
    }

    const match = url.pathname.match(/^\/users\/(\d+)$/);
    if (match) {
      const user = users[match[1]];
      if (!user) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("not found");
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(user));
      return;
    }

    res.writeHead(404);
    res.end("not found");
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  await startFixtureServer();
}

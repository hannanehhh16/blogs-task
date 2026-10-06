import { spawn } from "node:child_process";
import { startFixtureServer, FIXTURE_PORT } from "./server.mjs";

const APP_PORT = Number(process.env.TEST_APP_PORT || 3177);
const apiBase = `http://127.0.0.1:${FIXTURE_PORT}`;

await startFixtureServer(FIXTURE_PORT);

const env = {
  ...process.env,
  API_BASE_URL: apiBase,
  NEXT_DIST_DIR: ".next-test",
};

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: "inherit", shell: true });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited ${code}`));
    });
  });
}

await run("npx", ["next", "build"]);

const app = spawn("npx", ["next", "start", "-p", String(APP_PORT)], {
  env,
  stdio: "inherit",
  shell: true,
});

function shutdown() {
  app.kill();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.on("exit", (code) => {
  process.exit(code ?? 0);
});

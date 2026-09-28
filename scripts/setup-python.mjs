import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const localUv = path.join(homedir(), ".local", "bin", process.platform === "win32" ? "uv.exe" : "uv");
const uv = process.env.UV_BIN || (existsSync(localUv) ? localUv : "uv");
const python = path.resolve(".venv", process.platform === "win32" ? "Scripts/python.exe" : "bin/python");
const commands = existsSync(python) ? [] : [["venv", ".venv", "--python", "3.13", "--seed"]];
commands.push(["pip", "install", "--python", python, "-r", "backend/requirements.txt"]);
for (const args of commands) {
  const result = spawnSync(uv, args, { stdio: "inherit", windowsHide: true });
  if (result.error || result.status !== 0) {
    console.error(result.error?.message ?? "Python environment setup failed.");
    console.error("Install uv first: https://docs.astral.sh/uv/getting-started/installation/");
    process.exit(result.status || 1);
  }
}
console.log("Python parser is ready. Start the website with npm run dev.");

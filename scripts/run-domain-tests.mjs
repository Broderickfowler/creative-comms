import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
const files = readdirSync("tests/domain")
  .filter((name) => name.endsWith(".test.ts"))
  .map((name) => `tests/domain/${name}`);
if (files.length === 0) throw new Error("No domain tests found");
const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "--test", ...files],
  { stdio: "inherit" },
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);

import { cpSync, chmodSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const hookSrc = join(root, ".githooks");
const hookDst = join(root, ".git", "hooks");

if (!existsSync(join(root, ".git"))) {
  console.log("Git repository not found, skipping hooks installation.");
  process.exit(0);
}

if (!existsSync(hookSrc)) {
  console.log("No .githooks directory found, skipping hooks installation.");
  process.exit(0);
}

mkdirSync(hookDst, { recursive: true });

for (const hook of ["pre-commit", "pre-push"]) {
  const source = join(hookSrc, hook);
  const destination = join(hookDst, hook);

  if (existsSync(source)) {
    cpSync(source, destination);

    // chmod only matters on Unix-like systems,
    // but harmless to attempt where supported.
    try {
      chmodSync(destination, 0o755);
    } catch {
      // Ignore Windows permission limitations.
    }

    console.log(`Installed ${hook} hook`);
  }
}

console.log("Git hooks installed successfully.");

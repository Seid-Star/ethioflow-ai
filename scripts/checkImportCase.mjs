import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const SOURCE_FOLDERS = ["client/src", "server/src"];

const EXTENSIONS = [
  "",
  ".js",
  ".jsx",
  ".mjs",
  ".json",
  ".css",
  "/index.js",
  "/index.jsx",
];

const IMPORT_PATTERN =
  /(?:from\s*|import\s*(?:\(\s*)?)['"](\.{1,2}\/[^'"]+)['"]/g;

function walk(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return entry.name === "node_modules" ? [] : walk(full);
    }

    return /\.(jsx?|mjs)$/.test(entry.name) ? [full] : [];
  });
}

function check(absolute) {
  const parts = path.relative(root, absolute).split(path.sep);
  let current = root;

  for (let i = 0; i < parts.length; i++) {
    if (!fs.existsSync(current) || !fs.statSync(current).isDirectory()) {
      return { status: "missing" };
    }

    const entries = fs.readdirSync(current);
    const part = parts[i];

    if (entries.includes(part)) {
      current = path.join(current, part);

      if (i < parts.length - 1 && !fs.statSync(current).isDirectory()) {
        return { status: "missing" };
      }

      continue;
    }

    const near = entries.find(
      (name) => name.toLowerCase() === part.toLowerCase(),
    );

    return near
      ? { status: "case", actual: near, wrong: part }
      : { status: "missing" };
  }

  return fs.existsSync(current) ? { status: "ok" } : { status: "missing" };
}

const problems = [];
let checked = 0;

for (const folder of SOURCE_FOLDERS) {
  for (const file of walk(path.join(root, folder))) {
    const source = fs.readFileSync(file, "utf8");

    for (const match of source.matchAll(IMPORT_PATTERN)) {
      const specifier = match[1];
      const base = path.resolve(path.dirname(file), specifier);
      const results = EXTENSIONS.map((ext) => check(base + ext));

      checked += 1;

      if (results.some((result) => result.status === "ok")) continue;

      const caseIssue = results.find((result) => result.status === "case");

      problems.push({
        file: path.relative(root, file),
        specifier,
        reason: caseIssue
          ? `the path component is really called "${caseIssue.actual}", not "${caseIssue.wrong}" (this can fail on Linux)`
          : "no matching file or supported index file exists",
      });
    }
  }
}

if (problems.length === 0) {
  console.log(
    `Checked ${checked} imports. Every file name matches exactly. Safe to deploy.`,
  );
} else {
  console.log(
    `Found ${problems.length} problem${problems.length === 1 ? "" : "s"}:\n`,
  );

  for (const problem of problems) {
    console.log(
      `  ${problem.file}\n    import "${problem.specifier}": ${problem.reason}\n`,
    );
  }

  process.exit(1);
}

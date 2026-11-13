import { execFileSync } from "node:child_process";

const VIRTUAL_ID = "virtual:git-info";
const RESOLVED_ID = "\0" + VIRTUAL_ID;
const SEP = "\u001f"; // unit separator, safe inside commit messages

function git(args) {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function collect() {
  // Detached HEAD (common on CI) returns "HEAD", so fall back to host env vars.
  let branch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
  if (!branch || branch === "HEAD") {
    branch = process.env.VERCEL_GIT_COMMIT_REF || process.env.GITHUB_REF_NAME || process.env.BRANCH || branch || "main";
  }

  const raw = git(["log", "-n", "6", `--pretty=format:%H${SEP}%h${SEP}%an${SEP}%aI${SEP}%s`]);
  const commits = raw
    ? raw.split("\n").map((line) => {
        const [hash, short, author, date, message] = line.split(SEP);
        return { hash, short, author, date, message };
      })
    : [];

  const dirty = git(["status", "--porcelain"]).length > 0;
  return { branch, commits, dirty };
}

export default function gitInfo() {
  return {
    name: "git-info",
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id) {
      if (id === RESOLVED_ID) return `export default ${JSON.stringify(collect())};`;
    },
    // In dev, reload the page when you commit or switch branches.
    configureServer(server) {
      const reload = (file) => {
        if (!/[\\/]\.git[\\/](HEAD|logs[\\/]HEAD)$/.test(file)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.add([".git/HEAD", ".git/logs/HEAD"]);
      server.watcher.on("change", reload);
      server.watcher.on("add", reload);
    },
  };
}

import {
  emptyDir,
  ensureDir,
  walk,
  type WalkOptions,
} from "https://deno.land/std@0.203.0/fs/mod.ts";
import {
  format as formatSemver,
  rcompare as compareSemverDesc,
  type SemVer,
} from "https://deno.land/std@0.203.0/semver/mod.ts";
import { join } from "https://deno.land/std@0.203.0/path/mod.ts";
import { getLogger } from "https://deno.land/std@0.203.0/log/mod.ts";
import { readSWU } from "./swu.ts";

const DOMAIN = "swu.varos.cloud";

const IN_DIR = ".";
const OUT_DIR = "./dist";

const WALK_OPTIONS: WalkOptions = {
  includeFiles: true,
  includeDirs: false,
  exts: ["swu"],
  skip: [/^dist/, /^.github/],
};

const allSwuFiles: {
  version: SemVer;
  path: string;
  name: string;
  lastMod: Date | null;
}[] = [];

for await (const { path, name } of walk(IN_DIR, WALK_OPTIONS)) {
  const { version } = await readSWU(path);
  const { mtime } = await Deno.stat(path);

  allSwuFiles.push({ version, path, name, lastMod: mtime });
}

// sort files by semver (desc) or, if semver is equal, by
// last modified date (desc)
allSwuFiles.sort((a, b) => {
  const res = compareSemverDesc(a.version, b.version);

  if (res !== 0) return res;

  if (a.lastMod === null || b.lastMod === null) return 0;
  return b.lastMod.getTime() - a.lastMod.getTime();
});

const latestStable = allSwuFiles.find((x) => x.version.prerelease.length === 0);
const latestBeta = allSwuFiles.find((x) => x.version.prerelease[0] === "beta");
const latestRC = allSwuFiles.find((x) => x.version.prerelease[0] === "rc");

if (latestStable === undefined) {
  throw new Error("Could not find stable version");
}

await ensureDir(OUT_DIR);
await emptyDir(OUT_DIR);
await ensureDir(join(OUT_DIR, "static"));
await ensureDir(join(OUT_DIR, "v1"));

const stableUniqueName = crypto.randomUUID() + `.swu`;
const betaUniqueName = crypto.randomUUID() + `.swu`;
const rcUniqueName = crypto.randomUUID() + `.swu`;

{
  getLogger().info(
    `Latest Stable SWU: ${
      formatSemver(latestStable.version)
    } at ./${latestStable.path}`,
  );
  getLogger().debug(`Copying ${latestStable.path} to ${stableUniqueName}`);
  await Deno.copyFile(
    latestStable.path,
    join(OUT_DIR, "static", stableUniqueName),
  );
}

if (latestBeta) {
  getLogger().info(
    `Latest Beta SWU: ${
      formatSemver(latestBeta.version)
    } at ./${latestBeta.path}`,
  );
  getLogger().debug(`Copying ${latestBeta.path} to ${betaUniqueName}`);
  await Deno.copyFile(
    latestBeta.path,
    join(OUT_DIR, "static", betaUniqueName),
  );
}

if (latestRC) {
  getLogger().info(
    `Latest Release Candidate SWU: ${
      formatSemver(latestRC.version)
    } at ./${latestRC.path}`,
  );
  getLogger().debug(
    `Copying ${latestRC.path} to ${rcUniqueName}`,
  );
  await Deno.copyFile(
    latestRC.path,
    join(OUT_DIR, "static", rcUniqueName),
  );
}

const index: {
  indexFileVersion: 1;
  stable: { version: string; url: string };
  beta?: { version: string; url: string };
  rc?: { version: string; url: string };
} = {
  indexFileVersion: 1,
  stable: {
    version: formatSemver(latestStable.version),
    url: new URL(`/static/${stableUniqueName}`, `https://${DOMAIN}`).toString(),
  },
};

if (latestBeta) {
  index.beta = {
    version: formatSemver(latestBeta.version),
    url: new URL(`/static/${betaUniqueName}`, `https://${DOMAIN}`).toString(),
  };
}

if (latestRC) {
  index.rc = {
    version: formatSemver(latestRC.version),
    url: new URL(`/static/${rcUniqueName}`, `https://${DOMAIN}`)
      .toString(),
  };
}

getLogger().info("v1/index.json:");
getLogger().info(index);

await Deno.writeTextFile(
  join(OUT_DIR, "v1", "index.json"),
  JSON.stringify(index),
);

import {
  parse,
  type SemVer,
} from "https://deno.land/std@0.203.0/semver/mod.ts";
import { readCpio } from "./cpio.ts";

export async function readSWU(path: string): Promise<{ version: SemVer }> {
  const contents = await Deno.readFile(path);

  for await (const entry of readCpio(contents)) {
    if (entry.name !== "sw-description") continue;

    const decoder = new TextDecoder();
    const text = decoder.decode(entry.contents);

    const versionStr = text.match(/version\s*=\s*"(?<version>[^"]+)"/)?.groups
      ?.version;

    if (versionStr === undefined) {
      throw new Error(`Failed to extract version from ${path}`);
    }

    return { version: parse(versionStr) };
  }

  throw new Error(`Could not find sw-description file in ${path}`);
}

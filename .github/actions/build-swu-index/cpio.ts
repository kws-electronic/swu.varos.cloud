import { Readable } from "node:stream";
import { extract } from "npm:cpio-stream";

/**
 * Read a [cpio](https://linux.die.net/man/1/cpio) archive
 * @param data Bytes of cpio archive
 * @returns ReadableStreams of all files included in the cpio file
 */
export function readCpio(
  data: Uint8Array,
): ReadableStream<{ name: string; contents: Uint8Array }> {
  const e = extract();

  return new ReadableStream({
    start(controller) {
      e.on(
        "entry",
        function (
          header: {
            size: number;
            name: string;
          },
          stream: Readable,
          callback: () => void,
        ) {
          const contents = new Uint8Array(header.size);
          let i = 0;
          stream.on("data", (c: Uint8Array) => {
            contents.set(c, i);
            i += c.length;
          });

          stream.on("end", () => {
            controller.enqueue({ name: header.name, contents });
            callback();
          });

          stream.resume();
        },
      );

      e.on("finish", () => controller.close());
      e.on("error", (e: unknown) => controller.error(e));

      e.end(data);
    },
    cancel(reason) {
      e.destroy(reason);
    },
  });
}

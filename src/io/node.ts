// Node.js TTY を IO としてラップ
import type { IO, IOSize } from "./types.js";

export function createNodeIO(): IO {
  const stdin = process.stdin;
  const stdout = process.stdout;
  if (!stdout.isTTY) {
    throw new Error("stdout is not a TTY; Node IO requires a terminal.");
  }
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");

  return {
    getSize(): IOSize {
      return {
        cols: stdout.columns ?? 120,
        rows: stdout.rows ?? 40,
      };
    },
    write(data: string): void {
      stdout.write(data);
    },
    onKey(handler: (data: string) => void): () => void {
      const onData = (buf: Buffer | string): void => {
        handler(typeof buf === "string" ? buf : buf.toString("utf8"));
      };
      stdin.on("data", onData);
      return () => stdin.off("data", onData);
    },
    onResize(handler: () => void): () => void {
      stdout.on("resize", handler);
      return () => stdout.off("resize", handler);
    },
    dispose(): void {
      try {
        stdin.setRawMode(false);
      } catch {
        // ignore
      }
      stdin.pause();
    },
  };
}

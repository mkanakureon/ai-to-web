// raw モードの stdin を KeyEvent ストリームに変換
import type { KeyEvent } from "./types.js";

type Listener = (ev: KeyEvent) => void;

export type Keyboard = {
  dispose: () => void;
};

export function startKeyboard(onKey: Listener): Keyboard {
  const stdin = process.stdin;
  if (!stdin.isTTY) {
    throw new Error("stdin is not a TTY; interactive mode requires a terminal.");
  }
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");

  const handler = (data: string): void => {
    const ev = parseKey(data);
    if (ev) onKey(ev);
  };
  stdin.on("data", handler);

  return {
    dispose: (): void => {
      stdin.off("data", handler);
      try {
        stdin.setRawMode(false);
      } catch {
        // ignore
      }
      stdin.pause();
    },
  };
}

function parseKey(data: string): KeyEvent | null {
  // Ctrl+C / Ctrl+D
  if (data === "\x03" || data === "\x04") return { kind: "quit" };
  // 複数バイト（エスケープシーケンス等）は無視
  if (data.length > 1) return null;

  const ch = data.toLowerCase();
  switch (ch) {
    case "n": return { kind: "next" };
    case "p": return { kind: "prev" };
    case "r": return { kind: "reset" };
    case "q": return { kind: "quit" };
    case "h": return { kind: "hint" };
    case " ": return { kind: "toggleAuto" };
    case "1": return { kind: "mode", mode: "binary" };
    case "2": return { kind: "mode", mode: "hex" };
    case "3": return { kind: "mode", mode: "char" };
    case "a":
    case "b":
    case "c":
      return { kind: "choice", id: ch };
    default:
      return null;
  }
}

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
  // Ctrl+C / Ctrl+D: 画面を問わず強制終了
  if (data === "\x03" || data === "\x04") return { kind: "forceQuit" };
  // 矢印キー (ESC [ A/B/C/D)
  if (data === "\x1b[A") return { kind: "up" };
  if (data === "\x1b[B") return { kind: "down" };
  // Enter
  if (data === "\r" || data === "\n") return { kind: "enter" };
  // その他マルチバイト (未使用のエスケープ等) は無視
  if (data.length > 1) return null;

  const ch = data.toLowerCase();
  switch (ch) {
    case "n": return { kind: "next" };
    case "p": return { kind: "prev" };
    case "r": return { kind: "reset" };
    case "q": return { kind: "quit" };
    case "h": return { kind: "hint" };
    case "m": return { kind: "back" };
    case "j": return { kind: "down" };
    case "k": return { kind: "up" };
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

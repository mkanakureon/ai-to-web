// キー入力 (raw mode stdin / xterm.js) → KeyEvent パーサ。
// プラットフォーム固有の「入力源」は src/io/ で抽象化し、ここは純粋な parseKey のみ。
import type { KeyEvent } from "./types.js";

export function parseKey(data: string): KeyEvent | null {
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
    case "t": return { kind: "title" };
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

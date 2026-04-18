// ANSI エスケープ & 文字幅ヘルパー
// 8色カラーのみ使用（ターミナル差を避けるため、24bit / 256色は使わない）

export const clearScreen = (): string => "\x1b[2J\x1b[H";
export const moveTo = (row: number, col: number): string => `\x1b[${row};${col}H`;
export const hideCursor = (): string => "\x1b[?25l";
export const showCursor = (): string => "\x1b[?25h";

export const RESET = "\x1b[0m";
export const BOLD = "\x1b[1m";
export const DIM = "\x1b[2m";
export const INVERSE = "\x1b[7m";

export const FG = {
  default: "\x1b[39m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
} as const;

export function paint(style: string, text: string): string {
  return `${style}${text}${RESET}`;
}

// East Asian Width: 日本語は 2 セル、ASCII は 1 セル
export function charWidth(ch: string): number {
  const cp = ch.codePointAt(0) ?? 0;
  if (cp < 0x80) return 1;
  if (
    (cp >= 0x1100 && cp <= 0x115F) ||
    (cp >= 0x2E80 && cp <= 0x303E) ||
    (cp >= 0x3041 && cp <= 0x33FF) ||
    (cp >= 0x3400 && cp <= 0x4DBF) ||
    (cp >= 0x4E00 && cp <= 0x9FFF) ||
    (cp >= 0xA000 && cp <= 0xA4CF) ||
    (cp >= 0xAC00 && cp <= 0xD7A3) ||
    (cp >= 0xF900 && cp <= 0xFAFF) ||
    (cp >= 0xFE30 && cp <= 0xFE4F) ||
    (cp >= 0xFF00 && cp <= 0xFF60) ||
    (cp >= 0xFFE0 && cp <= 0xFFE6)
  ) {
    return 2;
  }
  return 1;
}

const ANSI_PATTERN = /\x1b\[[0-9;?]*[a-zA-Z]/g;

export function stripAnsi(s: string): string {
  return s.replace(ANSI_PATTERN, "");
}

export function stringWidth(s: string): number {
  const stripped = stripAnsi(s);
  let w = 0;
  for (const ch of stripped) w += charWidth(ch);
  return w;
}

// プレーンテキスト専用（ANSIコード入りは stringWidth で幅だけ測る）
export function truncate(s: string, maxWidth: number): string {
  let w = 0;
  let out = "";
  for (const ch of s) {
    const cw = charWidth(ch);
    if (w + cw > maxWidth) break;
    out += ch;
    w += cw;
  }
  return out;
}

export function padVisual(s: string, visualWidth: number): string {
  const w = stringWidth(s);
  if (w >= visualWidth) return s;
  return s + " ".repeat(visualWidth - w);
}

// ANSIエスケープを保ったまま visualWidth でクリップする
export function ansiAwareTruncate(s: string, maxWidth: number): string {
  if (maxWidth <= 0) return "";
  let w = 0;
  let out = "";
  let i = 0;
  let hasOpenAnsi = false;
  while (i < s.length) {
    const ch = s[i] ?? "";
    if (ch === "\x1b") {
      let j = i + 1;
      if (s[j] === "[") j++;
      while (j < s.length && !/[a-zA-Z]/.test(s[j] ?? "")) j++;
      out += s.substring(i, j + 1);
      const letter = s[j] ?? "";
      if (letter === "m") {
        const body = s.substring(i + 2, j);
        hasOpenAnsi = body !== "0" && body !== "";
      }
      i = j + 1;
      continue;
    }
    const cw = charWidth(ch);
    if (w + cw > maxWidth) break;
    out += ch;
    w += cw;
    i++;
  }
  if (hasOpenAnsi) out += RESET;
  return out;
}

// 文字幅を考慮して width ごとに折り返す（char-level wrap）
export function wrapLines(text: string, width: number): string[] {
  if (width <= 0) return [];
  if (text === "") return [""];
  const result: string[] = [];
  let current = "";
  let currentW = 0;
  for (const ch of text) {
    const cw = charWidth(ch);
    if (currentW + cw > width) {
      result.push(current);
      current = ch;
      currentW = cw;
    } else {
      current += ch;
      currentW += cw;
    }
  }
  if (current !== "" || result.length === 0) result.push(current);
  return result;
}

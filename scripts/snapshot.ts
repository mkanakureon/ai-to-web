// render() の ANSI 出力をパースして仮想スクリーンを再構成する。
// 実機 TTY なしで 4ペインレイアウト・T字・テキスト配置を検証するための開発用ユーティリティ。
// 使い方: npx tsx scripts/snapshot.ts [width] [height]

import { render } from "../src/render.js";
import { charWidth } from "../src/ansi.js";
import { l0_1 } from "../src/content/l0-1.js";
import type { AppState } from "../src/types.js";

type Grid = string[][];

function blankGrid(w: number, h: number): Grid {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => " "));
}

function reconstruct(ansi: string, w: number, h: number): Grid {
  const grid = blankGrid(w, h);
  let row = 1;
  let col = 1;
  let i = 0;
  while (i < ansi.length) {
    const ch = ansi[i];
    if (ch === "\x1b") {
      let j = i + 1;
      if (ansi[j] === "[") j++;
      let params = "";
      while (j < ansi.length && !/[a-zA-Z]/.test(ansi[j] ?? "")) {
        params += ansi[j];
        j++;
      }
      const letter = ansi[j];
      if (letter === "H") {
        const parts = params.split(";").map((s) => parseInt(s, 10));
        row = Number.isFinite(parts[0]) && (parts[0] ?? 0) > 0 ? parts[0]! : 1;
        col = Number.isFinite(parts[1]) && (parts[1] ?? 0) > 0 ? parts[1]! : 1;
      } else if (letter === "J") {
        // 2J で全消去。続く H が home に戻すのでここでは座標リセット不要。
      }
      i = j + 1;
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      i++;
      continue;
    }
    const c: string = ch ?? " ";
    const cw = charWidth(c);
    const rowArr = grid[row - 1];
    if (rowArr && col >= 1 && col <= w) {
      rowArr[col - 1] = c;
      if (cw === 2 && col + 1 <= w) rowArr[col] = "";
    }
    col += cw;
    i++;
  }
  return grid;
}

function gridToString(grid: Grid): string {
  return grid
    .map((r) => r.filter((c) => c !== "").join("").replace(/\s+$/, ""))
    .join("\n");
}

function makeState(stepIndex: number, quizInput: string | null = null): AppState {
  return {
    lesson: l0_1,
    stepIndex,
    displayMode: "binary",
    autoPlay: false,
    quizInput,
    quit: false,
  };
}

const args = process.argv.slice(2);
const W = Number.parseInt(args[0] ?? "120", 10);
const H = Number.parseInt(args[1] ?? "40", 10);

const separator = "=".repeat(W);

for (let i = 0; i < l0_1.steps.length; i++) {
  const label = `STEP ${i + 1}/${l0_1.steps.length}`;
  console.log(`\n${separator}`);
  console.log(`  ${label}`);
  console.log(separator);
  const out = render(makeState(i), W, H);
  console.log(gridToString(reconstruct(out, W, H)));
}

console.log(`\n${separator}`);
console.log(`  STEP 5 / correct answer (b)`);
console.log(separator);
console.log(gridToString(reconstruct(render(makeState(4, "b"), W, H), W, H)));

console.log(`\n${separator}`);
console.log(`  STEP 5 / wrong answer (a)`);
console.log(separator);
console.log(gridToString(reconstruct(render(makeState(4, "a"), W, H), W, H)));

console.log(`\n${separator}`);
console.log(`  MINIMUM SIZE 80x24`);
console.log(separator);
console.log(gridToString(reconstruct(render(makeState(4, "b"), 80, 24), 80, 24)));

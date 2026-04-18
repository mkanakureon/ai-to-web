// render() の ANSI 出力をパースして仮想スクリーンを再構成する。
// 実機 TTY なしで 4ペインレイアウト・T字・テキスト配置を検証するための開発用ユーティリティ。
// 使い方: npx tsx scripts/snapshot.ts [lessonId] [width] [height]
//   npx tsx scripts/snapshot.ts L0-2 120 40
//   npx tsx scripts/snapshot.ts all            (全レッスン・全ステップ)

import { render } from "../src/render.js";
import { charWidth } from "../src/ansi.js";
import { LESSONS, getLesson } from "../src/content/index.js";
import { enterTitle, enterMenu, enterIntro, enterLesson } from "../src/reduce.js";
import type { AppState, Lesson, LessonPlayState } from "../src/types.js";

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

function makeLessonState(lesson: Lesson, stepIndex: number, quizInput: string | null = null): LessonPlayState {
  return { ...enterLesson(lesson), stepIndex, quizInput };
}

function renderSnapshot(state: AppState, w: number, h: number): string {
  return gridToString(reconstruct(render(state, w, h), w, h));
}

const args = process.argv.slice(2);
const target = args[0] ?? "L0-1";
const W = Number.parseInt(args[1] ?? "120", 10);
const H = Number.parseInt(args[2] ?? "40", 10);
const separator = "=".repeat(W);

function dumpLesson(lesson: Lesson, w: number, h: number): void {
  console.log(`\n${separator}`);
  console.log(`  ${lesson.id} INTRO`);
  console.log(separator);
  console.log(renderSnapshot(enterIntro(lesson), w, h));
  for (let i = 0; i < lesson.steps.length; i++) {
    console.log(`\n${separator}`);
    console.log(`  ${lesson.id} STEP ${i + 1}/${lesson.steps.length}`);
    console.log(separator);
    console.log(renderSnapshot(makeLessonState(lesson, i), w, h));
  }
  const lastIndex = lesson.steps.length - 1;
  const lastStep = lesson.steps[lastIndex];
  if (lastStep?.explainQuiz.quiz) {
    console.log(`\n${separator}`);
    console.log(`  ${lesson.id} final step / correct answer (${lastStep.explainQuiz.quiz.correctId})`);
    console.log(separator);
    console.log(renderSnapshot(makeLessonState(lesson, lastIndex, lastStep.explainQuiz.quiz.correctId), w, h));
  }
}

function dumpTitle(w: number, h: number): void {
  console.log(`\n${separator}`);
  console.log(`  TITLE SCREEN`);
  console.log(separator);
  console.log(renderSnapshot(enterTitle(), w, h));
}

function dumpMenu(w: number, h: number): void {
  for (let i = 0; i < LESSONS.length; i++) {
    console.log(`\n${separator}`);
    console.log(`  MENU (selected=${LESSONS[i]?.id})`);
    console.log(separator);
    console.log(renderSnapshot(enterMenu(i), w, h));
    if (i >= 1) break; // 代表 2 個だけ出す
  }
}

if (target === "all") {
  dumpTitle(W, H);
  dumpMenu(W, H);
  for (const lesson of LESSONS) dumpLesson(lesson, W, H);
} else if (target === "title") {
  dumpTitle(W, H);
} else if (target === "menu") {
  dumpMenu(W, H);
} else {
  const lesson = getLesson(target);
  if (!lesson) {
    console.error(`Unknown lesson: ${target}`);
    console.error(`Available: ${LESSONS.map((l) => l.id).join(", ") + ", all"}`);
    process.exit(1);
  }
  dumpLesson(lesson, W, H);
}

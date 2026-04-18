// 4ペインレイアウトと描画
// 設計出典: docs/reports/2026/04/18/03-tui-foundation-design.md

import type {
  AppState,
  LessonIntroState,
  LessonPlayState,
  MenuState,
  TargetPaneState,
  RepresentationPaneState,
  CpuBusMemoryState,
  ExplainQuizPaneState,
} from "./types.js";
import { LESSONS } from "./content/index.js";
import {
  clearScreen,
  moveTo,
  RESET,
  BOLD,
  DIM,
  INVERSE,
  FG,
  paint,
  charWidth,
  stringWidth,
  truncate,
  padVisual,
  ansiAwareTruncate,
  wrapLines,
} from "./ansi.js";

type Rect = {
  row: number;
  col: number;
  width: number;
  height: number;
};

type Layout = {
  totalWidth: number;
  totalHeight: number;
  topRow: number;
  midRow: number;
  bottomRow: number;
  hintRow: number;
  topSplitCol: number;
  bottomSplitCol: number;
  target: Rect;
  representation: Rect;
  cpuBusMemory: Rect;
  explainQuiz: Rect;
};

function computeLayout(termW: number, termH: number): Layout {
  const W = Math.max(80, termW);
  const H = Math.max(24, termH);

  const topRow = 1;
  const hintRow = H;
  // ボックスは row 1..H-1、ヒント行は row H
  // 内部行数 = H - 1 - 3 (上 / 中 / 下 の罫線) = H - 4
  const innerRowsTotal = H - 4;
  const topInnerRows = Math.max(3, Math.floor(innerRowsTotal * 0.35));
  const bottomInnerRows = innerRowsTotal - topInnerRows;

  const midRow = topRow + 1 + topInnerRows;
  const bottomRow = midRow + 1 + bottomInnerRows;

  const topSplitCol = Math.max(20, Math.floor(W * 0.5));
  const bottomSplitColRaw = Math.max(30, Math.floor(W * 0.6));
  // top と bottom の split が隣接してると装飾崩れるので最低 2 離す
  const bottomSplitCol = Math.max(bottomSplitColRaw, topSplitCol + 2);

  return {
    totalWidth: W,
    totalHeight: H,
    topRow,
    midRow,
    bottomRow,
    hintRow,
    topSplitCol,
    bottomSplitCol,
    target: {
      row: topRow + 1,
      col: 2,
      width: topSplitCol - 2,
      height: topInnerRows,
    },
    representation: {
      row: topRow + 1,
      col: topSplitCol + 1,
      width: W - topSplitCol - 1,
      height: topInnerRows,
    },
    cpuBusMemory: {
      row: midRow + 1,
      col: 2,
      width: bottomSplitCol - 2,
      height: bottomInnerRows,
    },
    explainQuiz: {
      row: midRow + 1,
      col: bottomSplitCol + 1,
      width: W - bottomSplitCol - 1,
      height: bottomInnerRows,
    },
  };
}

type HLine = {
  width: number;
  leftCorner: string;
  rightCorner: string;
  crossings: Array<{ col: number; char: string }>;
  titles: Array<{ startCol: number; text: string }>;
};

function buildHLine(line: HLine): string {
  const cells: string[] = new Array(line.width + 1).fill("─");
  cells[0] = "";
  cells[1] = line.leftCorner;
  cells[line.width] = line.rightCorner;
  for (const c of line.crossings) {
    if (c.col >= 1 && c.col <= line.width) {
      cells[c.col] = c.char;
    }
  }
  for (const t of line.titles) {
    let col = t.startCol;
    for (const ch of t.text) {
      if (col > line.width - 1) break;
      const cw = charWidth(ch);
      cells[col] = ch;
      if (cw === 2 && col + 1 <= line.width) cells[col + 1] = "";
      col += cw;
    }
  }
  let out = "";
  for (let i = 1; i <= line.width; i++) {
    out += cells[i];
  }
  return out;
}

function renderFrame(l: Layout): string {
  const W = l.totalWidth;
  const parts: string[] = [];

  const topLine = buildHLine({
    width: W,
    leftCorner: "┌",
    rightCorner: "┐",
    crossings: [{ col: l.topSplitCol, char: "┬" }],
    titles: [
      { startCol: 3, text: " Target / Source " },
      { startCol: l.topSplitCol + 3, text: " Representation " },
    ],
  });
  parts.push(moveTo(l.topRow, 1) + topLine);

  const midCrossings: Array<{ col: number; char: string }> = [];
  if (l.topSplitCol === l.bottomSplitCol) {
    midCrossings.push({ col: l.topSplitCol, char: "┼" });
  } else {
    midCrossings.push({ col: l.topSplitCol, char: "┴" });
    midCrossings.push({ col: l.bottomSplitCol, char: "┬" });
  }
  const midLine = buildHLine({
    width: W,
    leftCorner: "├",
    rightCorner: "┤",
    crossings: midCrossings,
    titles: [
      { startCol: 3, text: " CPU / Bus / Memory " },
      { startCol: l.bottomSplitCol + 3, text: " Explain / Quiz " },
    ],
  });
  parts.push(moveTo(l.midRow, 1) + midLine);

  const bottomLine = buildHLine({
    width: W,
    leftCorner: "└",
    rightCorner: "┘",
    crossings: [{ col: l.bottomSplitCol, char: "┴" }],
    titles: [],
  });
  parts.push(moveTo(l.bottomRow, 1) + bottomLine);

  // 上段の縦線
  for (let r = l.topRow + 1; r < l.midRow; r++) {
    parts.push(moveTo(r, 1) + "│");
    parts.push(moveTo(r, l.topSplitCol) + "│");
    parts.push(moveTo(r, W) + "│");
  }
  // 下段の縦線
  for (let r = l.midRow + 1; r < l.bottomRow; r++) {
    parts.push(moveTo(r, 1) + "│");
    parts.push(moveTo(r, l.bottomSplitCol) + "│");
    parts.push(moveTo(r, W) + "│");
  }

  return parts.join("");
}

function renderLine(row: number, col: number, text: string, rectWidth: number): string {
  const clipped = stringWidth(text) > rectWidth ? ansiAwareTruncate(text, rectWidth) : text;
  const visual = stringWidth(clipped);
  const padding = visual < rectWidth ? " ".repeat(Math.max(0, rectWidth - visual)) : "";
  return moveTo(row, col) + clipped + padding;
}

function renderPaneBackground(rect: Rect): string {
  let out = "";
  const blank = " ".repeat(rect.width);
  for (let i = 0; i < rect.height; i++) {
    out += moveTo(rect.row + i, rect.col) + blank;
  }
  return out;
}

function renderTarget(rect: Rect, s: TargetPaneState): string {
  let out = renderPaneBackground(rect);
  for (let i = 0; i < rect.height; i++) {
    const line = s.lines[i] ?? "";
    const text = truncate(line, rect.width);
    const styled = s.highlightLine === i ? paint(FG.cyan + BOLD, text) : text;
    out += renderLine(rect.row + i, rect.col, styled, rect.width);
  }
  return out;
}

function renderRepresentation(rect: Rect, s: RepresentationPaneState): string {
  let out = renderPaneBackground(rect);
  for (let i = 0; i < rect.height; i++) {
    const item = s.items[i];
    if (!item) {
      out += renderLine(rect.row + i, rect.col, "", rect.width);
      continue;
    }
    const label = item.label.padEnd(10, " ");
    const line = truncate(`${label}: ${item.value}`, rect.width);
    out += renderLine(rect.row + i, rect.col, line, rect.width);
  }
  return out;
}

function renderCpuBusMemory(rect: Rect, s: CpuBusMemoryState): string {
  let out = renderPaneBackground(rect);
  const lines: string[] = [];

  const mar = s.mar ?? "----";
  const mdr = s.mdr ?? "----";
  lines.push(paint(FG.yellow + BOLD, `[CPU]  MAR=${mar}  MDR=${mdr}`));
  lines.push("");

  const addr = s.addressBusValue ?? "----";
  const data = s.dataBusValue ?? "----";
  const addrActive = s.phase === "send-address" || s.phase === "select-memory";
  const dataActive = s.phase === "return-data" || s.phase === "done";
  lines.push(
    (addrActive ? paint(FG.blue + BOLD, `Address Bus:  ${addr}  ----->`) : paint(DIM, `Address Bus:  ${addr}  ----->`)),
  );
  lines.push(
    (dataActive ? paint(FG.green + BOLD, `Data Bus:     ${data}  <-----`) : paint(DIM, `Data Bus:     ${data}  <-----`)),
  );
  lines.push("");

  lines.push("Memory:");
  for (const cell of s.memoryCells) {
    const labelPart = cell.label ? `  ${cell.label}` : "";
    const base = `  ${cell.address}: ${cell.value}${labelPart}`;
    let rendered: string;
    if (cell.selected) {
      rendered = `${INVERSE}${base}${RESET}`;
    } else if (cell.dim) {
      rendered = paint(DIM, base);
    } else {
      rendered = base;
    }
    lines.push(rendered);
  }

  for (let i = 0; i < rect.height; i++) {
    const line = lines[i] ?? "";
    out += renderLine(rect.row + i, rect.col, line, rect.width);
  }
  return out;
}

function computeKeyHints(isLastStep: boolean, hasQuiz: boolean): string[] {
  const hints = [
    isLastStep ? "[n]finish" : "[n]next",
    "[p]prev",
    "[m/q]menu",
  ];
  if (hasQuiz) hints.push("[a/b/c]answer");
  return hints;
}

function renderExplainQuiz(
  rect: Rect,
  s: ExplainQuizPaneState,
  quizInput: string | null,
  isLastStep: boolean,
): string {
  let out = renderPaneBackground(rect);
  const lines: string[] = [];

  for (const exp of s.explanationLines) {
    for (const wrapped of wrapLines(exp, rect.width)) {
      lines.push(wrapped);
    }
  }

  const quiz = s.quiz;
  if (quiz) {
    lines.push("");
    lines.push(paint(BOLD, `Q: ${quiz.question}`));
    for (const c of quiz.choices) {
      const base = `  ${c.id}) ${c.text}`;
      if (quizInput === c.id) {
        if (c.id === quiz.correctId) {
          lines.push(paint(FG.green + BOLD, `${base}  [OK]`));
        } else {
          lines.push(paint(FG.red + BOLD, `${base}  [X]`));
        }
      } else {
        lines.push(base);
      }
    }
    if (quizInput) {
      lines.push("");
      if (quizInput === quiz.correctId) {
        const msg = isLastStep ? "正解! [n] で完了 → メニューへ" : "正解! [n] で次へ";
        lines.push(paint(FG.green, msg));
      } else {
        const correct = quiz.choices.find((c) => c.id === quiz.correctId);
        const correctText = correct ? `${correct.id}) ${correct.text}` : quiz.correctId;
        lines.push(paint(FG.red, `不正解。正解は ${correctText}`));
      }
    }
  }

  const keyHints = computeKeyHints(isLastStep, !!s.quiz);
  lines.push("");
  lines.push(paint(DIM, keyHints.join("  ")));

  for (let i = 0; i < rect.height; i++) {
    const line = lines[i] ?? "";
    out += renderLine(rect.row + i, rect.col, line, rect.width);
  }
  return out;
}

function centerCol(termW: number, text: string): number {
  return Math.max(1, Math.floor((termW - stringWidth(text)) / 2) + 1);
}

function renderTitle(termW: number, termH: number): string {
  const W = Math.max(80, termW);
  const H = Math.max(24, termH);

  const titleBox = [
    "╔════════════════════════════════════╗",
    "║                                    ║",
    "║          a i - t o - w e b         ║",
    "║                                    ║",
    "╚════════════════════════════════════╝",
  ];
  const subtitle = [
    "「CPU → バス → メモリ」を見ながら",
    "AI と会話できる知識を身につける TUI 学習ツール",
  ];
  const hints = [
    "[Enter]  start",
    "[q]      quit",
  ];

  let out = clearScreen();

  const total = titleBox.length + 2 + subtitle.length + 3 + hints.length;
  let row = Math.max(2, Math.floor((H - total) / 2));

  for (const line of titleBox) {
    out += moveTo(row, centerCol(W, line)) + paint(FG.cyan + BOLD, line);
    row++;
  }
  row += 2;
  for (const line of subtitle) {
    out += moveTo(row, centerCol(W, line)) + line;
    row++;
  }
  row += 3;
  for (const line of hints) {
    out += moveTo(row, centerCol(W, line)) + paint(DIM, line);
    row++;
  }
  return out;
}

function renderMenu(state: MenuState, termW: number, termH: number): string {
  const W = Math.max(80, termW);
  const H = Math.max(24, termH);

  const header = "Select a Lesson";
  const items = LESSONS.map((l, i) => {
    const marker = i === state.index ? ">" : " ";
    return `${marker}  ${l.id.padEnd(5)}  ${l.title}`;
  });
  const hints = ["[up/down or j/k]  select    [Enter]  start    [q]  quit"];

  let out = clearScreen();

  const total = 1 + 2 + items.length + 3 + hints.length;
  let row = Math.max(2, Math.floor((H - total) / 2));

  out += moveTo(row, centerCol(W, header)) + paint(BOLD, header);
  row += 3;

  const itemWidths = items.map((it) => stringWidth(it));
  const maxItemW = Math.max(1, ...itemWidths);
  const itemCol = Math.max(1, Math.floor((W - maxItemW) / 2) + 1);

  for (const [i, item] of items.entries()) {
    const line = i === state.index ? paint(INVERSE, item) : item;
    out += moveTo(row, itemCol) + line;
    row++;
  }
  row += 3;

  for (const line of hints) {
    out += moveTo(row, centerCol(W, line)) + paint(DIM, line);
    row++;
  }
  return out;
}

function renderIntro(state: LessonIntroState, termW: number, termH: number): string {
  const W = Math.max(80, termW);
  const H = Math.max(24, termH);

  const contentW = Math.min(76, W - 8);
  const leftCol = Math.max(1, Math.floor((W - contentW) / 2) + 1);
  const innerCol = leftCol + 2;
  const innerW = contentW - 2;

  let out = clearScreen();
  let row = 2;

  // Header: "L0-1  2進数とビット" + underline
  const header = `${state.lesson.id}  ${state.lesson.title}`;
  out += moveTo(row, leftCol) + paint(FG.cyan + BOLD, header);
  row++;
  out += moveTo(row, leftCol) + paint(FG.cyan, "─".repeat(Math.min(stringWidth(header) + 6, contentW)));
  row += 2;

  // 到達目標
  out += moveTo(row, leftCol) + paint(BOLD, "到達目標");
  row++;
  for (const line of wrapLines(state.lesson.intro.objective, innerW)) {
    out += moveTo(row, innerCol) + line;
    row++;
  }
  row++;

  // このレッスンについて
  out += moveTo(row, leftCol) + paint(BOLD, "このレッスンについて");
  row++;
  for (const paragraph of state.lesson.intro.overview) {
    for (const line of wrapLines(paragraph, innerW)) {
      out += moveTo(row, innerCol) + line;
      row++;
    }
    row++;
  }

  // キーワード
  if (state.lesson.intro.terms.length > 0) {
    out += moveTo(row, leftCol) + paint(BOLD, "キーワード");
    row++;
    for (const t of state.lesson.intro.terms) {
      const head = `・${t.term}`;
      out += moveTo(row, innerCol) + paint(FG.cyan, head);
      row++;
      for (const line of wrapLines(t.description, innerW - 4)) {
        out += moveTo(row, innerCol + 4) + paint(DIM, line);
        row++;
      }
    }
    row++;
  }

  // 予告
  if (state.lesson.intro.firstStepHint) {
    for (const line of wrapLines(state.lesson.intro.firstStepHint, innerW)) {
      out += moveTo(row, leftCol) + paint(DIM, line);
      row++;
    }
  }

  // 最下行のキーヒント (観察ステップの有無で動的に切替)
  const hasSteps = state.lesson.steps.length > 0;
  const bottomHint = hasSteps
    ? "[Enter / n]  観察を始める      [m / q]  メニューへ戻る"
    : "[Enter / n / m / q]  メニューへ戻る";
  out += moveTo(H, Math.max(1, Math.floor((W - stringWidth(bottomHint)) / 2) + 1)) + paint(DIM, bottomHint);

  return out;
}

function renderLesson(state: LessonPlayState, termW: number, termH: number): string {
  const layout = computeLayout(termW, termH);
  let out = clearScreen();
  out += renderFrame(layout);

  const lastIndex = state.lesson.steps.length - 1;
  const isLastStep = state.stepIndex === lastIndex;
  const step = state.lesson.steps[state.stepIndex];
  if (step) {
    out += renderTarget(layout.target, step.target);
    out += renderRepresentation(layout.representation, step.representation);
    out += renderCpuBusMemory(layout.cpuBusMemory, step.cpuBusMemory);
    out += renderExplainQuiz(layout.explainQuiz, step.explainQuiz, state.quizInput, isLastStep);
  }

  const progress = `${state.lesson.id} step ${state.stepIndex + 1}/${state.lesson.steps.length}`;
  const modeLabel = `mode:${state.displayMode}`;
  const nextLabel = isLastStep ? "finish" : "next";
  const hint = `${progress}   [n]${nextLabel} [p]prev [r]reset [m/q]menu [space]auto [1/2/3]mode   ${modeLabel}`;
  out += moveTo(layout.hintRow, 1) + truncate(hint, layout.totalWidth);

  return out;
}

export function render(state: AppState, termW: number, termH: number): string {
  switch (state.screen) {
    case "title":
      return renderTitle(termW, termH);
    case "menu":
      return renderMenu(state, termW, termH);
    case "intro":
      return renderIntro(state, termW, termH);
    case "lesson":
      return renderLesson(state, termW, termH);
  }
}

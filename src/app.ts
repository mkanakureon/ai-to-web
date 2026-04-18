// メインループ: input → reduce → render
import { l0_1 } from "./content/l0-1.js";
import type { AppState } from "./types.js";
import { reduce } from "./reduce.js";
import { render } from "./render.js";
import { startKeyboard, type Keyboard } from "./keyboard.js";
import { clearScreen, hideCursor, showCursor, moveTo, RESET } from "./ansi.js";

function initialState(): AppState {
  return {
    lesson: l0_1,
    stepIndex: 0,
    displayMode: "binary",
    autoPlay: false,
    quizInput: null,
    quit: false,
  };
}

function getTermSize(): { w: number; h: number } {
  return {
    w: process.stdout.columns ?? 120,
    h: process.stdout.rows ?? 40,
  };
}

function restoreTerminal(): void {
  const h = process.stdout.rows ?? 24;
  process.stdout.write(showCursor() + moveTo(h, 1) + RESET + "\n");
}

// 異常終了時のカーソル復帰
process.on("exit", () => {
  process.stdout.write(showCursor() + RESET);
});

export async function runApp(): Promise<void> {
  if (!process.stdout.isTTY) {
    runHeadless();
    return;
  }

  let state = initialState();
  const draw = (): void => {
    const { w, h } = getTermSize();
    process.stdout.write(render(state, w, h));
  };

  const onResize = (): void => draw();
  let kb: Keyboard | null = null;

  process.stdout.write(hideCursor() + clearScreen());
  draw();
  process.stdout.on("resize", onResize);

  await new Promise<void>((resolve) => {
    kb = startKeyboard((ev) => {
      state = reduce(state, ev);
      if (state.quit) {
        process.stdout.off("resize", onResize);
        kb?.dispose();
        restoreTerminal();
        resolve();
        return;
      }
      draw();
    });
  });
}

function runHeadless(): void {
  const state = initialState();
  console.log(`[ai-to-web] TTY未検出のためヘッドレスモードでレッスン情報のみ表示`);
  console.log(`lesson: ${state.lesson.id} "${state.lesson.title}"`);
  console.log(`steps : ${state.lesson.steps.length}`);
  for (const [i, step] of state.lesson.steps.entries()) {
    const quiz = step.explainQuiz.quiz ? " (quiz)" : "";
    const memSel = step.cpuBusMemory.memoryCells.find((c) => c.selected)?.address ?? "-";
    console.log(`  step ${i + 1}: reps=${step.representation.items.length} selMem=${memSel} phase=${step.cpuBusMemory.phase}${quiz}`);
  }
}

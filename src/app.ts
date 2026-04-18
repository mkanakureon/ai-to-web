// メインループ: input → reduce → render
import { getLesson, listLessonIds, LESSONS } from "./content/index.js";
import type { AppState, Lesson } from "./types.js";
import { reduce, enterTitle, enterLesson } from "./reduce.js";
import { render } from "./render.js";
import { startKeyboard, type Keyboard } from "./keyboard.js";
import { clearScreen, hideCursor, showCursor, moveTo, RESET } from "./ansi.js";

function selectInitialState(argv: string[]): AppState {
  const requested = argv[2];
  if (!requested) return enterTitle();
  if (requested === "--help" || requested === "-h") {
    printUsage();
    process.exit(0);
  }
  if (requested === "--list") {
    console.log(listLessonIds().join("\n"));
    process.exit(0);
  }
  const lesson = getLesson(requested);
  if (!lesson) {
    console.error(`Unknown lesson: ${requested}`);
    console.error(`Available: ${listLessonIds().join(", ")}`);
    process.exit(1);
  }
  return enterLesson(lesson);
}

function printUsage(): void {
  console.log(`Usage: ai-to-web [lesson-id]

  (no argument)        タイトル画面 → メニュー → レッスン選択
  lesson-id            指定レッスンに直接入る (${listLessonIds().join(" | ")})

  --list     利用可能なレッスン ID を列挙
  --help     このヘルプを表示`);
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
  const initial = selectInitialState(process.argv);

  if (!process.stdout.isTTY) {
    runHeadless(initial);
    return;
  }

  let state: AppState = initial;
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

function runHeadless(state: AppState): void {
  if (state.screen === "title") {
    console.log(`[ai-to-web] TTY未検出。タイトル画面 (ヘッドレス)`);
    console.log(`lessons: ${LESSONS.map((l) => l.id).join(", ")}`);
    return;
  }
  if (state.screen === "menu") {
    console.log(`[ai-to-web] TTY未検出。メニュー画面 (index=${state.index})`);
    for (const [i, l] of LESSONS.entries()) {
      const marker = i === state.index ? ">" : " ";
      console.log(`  ${marker} ${l.id.padEnd(5)} ${l.title}`);
    }
    return;
  }
  // lesson
  const lesson: Lesson = state.lesson;
  console.log(`[ai-to-web] TTY未検出のためヘッドレス表示 (lesson=${lesson.id})`);
  console.log(`lesson: ${lesson.id} "${lesson.title}"`);
  console.log(`steps : ${lesson.steps.length}`);
  for (const [i, step] of lesson.steps.entries()) {
    const quiz = step.explainQuiz.quiz ? " (quiz)" : "";
    const memSel = step.cpuBusMemory.memoryCells.find((c) => c.selected)?.address ?? "-";
    console.log(`  step ${i + 1}: reps=${step.representation.items.length} selMem=${memSel} phase=${step.cpuBusMemory.phase}${quiz}`);
  }
}

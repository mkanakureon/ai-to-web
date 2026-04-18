// メインループ: input → reduce → render
import { getLesson, listLessonIds, LESSONS } from "./content/index.js";
import type { AppState, Lesson } from "./types.js";
import { reduce } from "./reduce.js";
import { render } from "./render.js";
import { startKeyboard, type Keyboard } from "./keyboard.js";
import { clearScreen, hideCursor, showCursor, moveTo, RESET } from "./ansi.js";

const DEFAULT_LESSON_ID = "L0-1";

function selectLesson(argv: string[]): Lesson {
  const requested = argv[2];
  if (!requested) {
    const first = LESSONS[0];
    if (!first) throw new Error("No lessons registered");
    return first;
  }
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
  return lesson;
}

function printUsage(): void {
  console.log(`Usage: ai-to-web [lesson-id]

  lesson-id: ${listLessonIds().join(" | ")}  (default: ${DEFAULT_LESSON_ID})

  --list     list available lessons
  --help     show this help`);
}

function initialState(lesson: Lesson): AppState {
  return {
    lesson,
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
  const lesson = selectLesson(process.argv);

  if (!process.stdout.isTTY) {
    runHeadless(lesson);
    return;
  }

  let state = initialState(lesson);
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

function runHeadless(lesson: Lesson): void {
  console.log(`[ai-to-web] TTY未検出のためヘッドレス表示 (lesson=${lesson.id})`);
  console.log(`lesson: ${lesson.id} "${lesson.title}"`);
  console.log(`steps : ${lesson.steps.length}`);
  for (const [i, step] of lesson.steps.entries()) {
    const quiz = step.explainQuiz.quiz ? " (quiz)" : "";
    const memSel = step.cpuBusMemory.memoryCells.find((c) => c.selected)?.address ?? "-";
    console.log(`  step ${i + 1}: reps=${step.representation.items.length} selMem=${memSel} phase=${step.cpuBusMemory.phase}${quiz}`);
  }
}

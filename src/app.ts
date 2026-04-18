// メインループ: input → reduce → render
// I/O は引数で受け取る (Node TTY / xterm.js どちらでも動く)
import { getLesson, listLessonIds, LESSONS } from "./content/index.js";
import type { AppState, Lesson } from "./types.js";
import { reduce, enterTitle, enterLesson } from "./reduce.js";
import { render } from "./render.js";
import { parseKey } from "./keyboard.js";
import { clearScreen, hideCursor, showCursor, moveTo, RESET } from "./ansi.js";
import type { IO } from "./io/types.js";

export function selectInitialState(argv: string[]): AppState {
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

export async function runApp(io: IO, initial: AppState): Promise<void> {
  let state: AppState = initial;
  const draw = (): void => {
    const { cols, rows } = io.getSize();
    io.write(render(state, cols, rows));
  };

  io.write(hideCursor() + clearScreen());
  draw();

  const unsubResize = io.onResize(draw);

  await new Promise<void>((resolve) => {
    const unsubKey = io.onKey((data) => {
      const ev = parseKey(data);
      if (!ev) return;
      state = reduce(state, ev);
      if (state.quit) {
        unsubKey();
        unsubResize();
        io.write(showCursor() + RESET);
        resolve();
        return;
      }
      draw();
    });
  });
}

export function runHeadless(state: AppState): void {
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

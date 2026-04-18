// 純粋関数で AppState を遷移させる
import type {
  AppState,
  KeyEvent,
  Lesson,
  LessonIntroState,
  LessonPlayState,
  MenuState,
  TitleState,
} from "./types.js";
import { LESSONS } from "./content/index.js";

// ── 画面コンストラクタ ──

export function enterTitle(): TitleState {
  return { screen: "title", quit: false };
}

export function enterMenu(index = 0): MenuState {
  const n = LESSONS.length;
  const clamped = n === 0 ? 0 : Math.max(0, Math.min(n - 1, index));
  return { screen: "menu", index: clamped, quit: false };
}

export function enterIntro(lesson: Lesson): LessonIntroState {
  return { screen: "intro", lesson, quit: false };
}

export function enterLesson(lesson: Lesson): LessonPlayState {
  return {
    screen: "lesson",
    lesson,
    stepIndex: 0,
    displayMode: "binary",
    autoPlay: false,
    quizInput: null,
    quit: false,
  };
}

// ── リデューサ ──

export function reduce(state: AppState, event: KeyEvent): AppState {
  if (state.quit) return state;

  // forceQuit (Ctrl+C / Ctrl+D) は画面を問わず即終了
  if (event.kind === "forceQuit") {
    return { ...state, quit: true };
  }

  // "t" はどこからでもタイトル画面へ戻る (タイトル画面では無視)
  if (event.kind === "title" && state.screen !== "title") {
    return enterTitle();
  }

  switch (state.screen) {
    case "title":
      return reduceTitle(state, event);
    case "menu":
      return reduceMenu(state, event);
    case "intro":
      return reduceIntro(state, event);
    case "lesson":
      return reduceLesson(state, event);
  }
}

function reduceTitle(state: TitleState, event: KeyEvent): AppState {
  switch (event.kind) {
    case "enter":
    case "next":
      return enterMenu(0);
    case "quit":
    case "back":
      return { ...state, quit: true };
    default:
      return state;
  }
}

function reduceMenu(state: MenuState, event: KeyEvent): AppState {
  switch (event.kind) {
    case "up":
    case "prev":
      return { ...state, index: Math.max(0, state.index - 1) };
    case "down":
    case "next":
      return { ...state, index: Math.min(LESSONS.length - 1, state.index + 1) };
    case "enter": {
      const lesson = LESSONS[state.index];
      if (lesson) return enterIntro(lesson);
      return state;
    }
    case "quit":
    case "back":
      return { ...state, quit: true };
    default:
      return state;
  }
}

function reduceIntro(state: LessonIntroState, event: KeyEvent): AppState {
  switch (event.kind) {
    case "enter":
    case "next": {
      // 観察ステップがない (文書のみ) レッスンは、intro を閉じるとメニューへ戻る
      if (state.lesson.steps.length === 0) {
        const idx = LESSONS.findIndex((l) => l.id === state.lesson.id);
        return enterMenu(idx >= 0 ? idx : 0);
      }
      return enterLesson(state.lesson);
    }
    case "quit":
    case "back": {
      const idx = LESSONS.findIndex((l) => l.id === state.lesson.id);
      return enterMenu(idx >= 0 ? idx : 0);
    }
    default:
      return state;
  }
}

function reduceLesson(state: LessonPlayState, event: KeyEvent): AppState {
  switch (event.kind) {
    case "next": {
      const max = state.lesson.steps.length - 1;
      if (state.stepIndex < max) {
        return { ...state, stepIndex: state.stepIndex + 1, quizInput: null };
      }
      // 最終ステップでの next はレッスン完了としてメニューへ戻る
      const idx = LESSONS.findIndex((l) => l.id === state.lesson.id);
      return enterMenu(idx >= 0 ? idx : 0);
    }
    case "prev": {
      if (state.stepIndex > 0) {
        return { ...state, stepIndex: state.stepIndex - 1, quizInput: null };
      }
      return state;
    }
    case "reset":
      return { ...state, stepIndex: 0, quizInput: null };
    case "quit":
    case "back": {
      // レッスンから抜けてメニューへ。現在のレッスンを選択状態で返す
      const idx = LESSONS.findIndex((l) => l.id === state.lesson.id);
      return enterMenu(idx >= 0 ? idx : 0);
    }
    case "hint":
      return state;
    case "toggleAuto":
      return { ...state, autoPlay: !state.autoPlay };
    case "mode":
      return { ...state, displayMode: event.mode };
    case "choice": {
      const step = state.lesson.steps[state.stepIndex];
      if (!step?.explainQuiz.quiz) return state;
      return { ...state, quizInput: event.id };
    }
    default:
      return state;
  }
}

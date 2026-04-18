// 純粋関数で AppState を遷移させる
import type { AppState, KeyEvent } from "./types.js";

export function reduce(state: AppState, event: KeyEvent): AppState {
  if (state.quit) return state;

  switch (event.kind) {
    case "next": {
      const max = state.lesson.steps.length - 1;
      if (state.stepIndex < max) {
        return { ...state, stepIndex: state.stepIndex + 1, quizInput: null };
      }
      return state;
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
      return { ...state, quit: true };
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
  }
}

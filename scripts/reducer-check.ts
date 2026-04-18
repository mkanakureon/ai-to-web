// reducer の状態遷移テスト。期待値と一致しなければ exit 1。
// 使い方: npx tsx scripts/reducer-check.ts

import { reduce, enterTitle, enterMenu, enterIntro, enterLesson } from "../src/reduce.js";
import { l0_1 } from "../src/content/l0-1.js";
import type { AppState, KeyEvent, LessonPlayState } from "../src/types.js";

function lessonInitial(): LessonPlayState {
  return enterLesson(l0_1);
}

type Case = {
  name: string;
  initial: AppState;
  events: KeyEvent[];
  expect: Record<string, unknown>;
};

const cases: Case[] = [
  // ── lesson 遷移 ──
  { name: "lesson: initial", initial: lessonInitial(), events: [], expect: { screen: "lesson", stepIndex: 0, quit: false, quizInput: null } },
  { name: "lesson: next x1", initial: lessonInitial(), events: [{ kind: "next" }], expect: { screen: "lesson", stepIndex: 1 } },
  { name: "lesson: next x4 to last step", initial: lessonInitial(), events: Array.from({ length: 4 }, () => ({ kind: "next" as const })), expect: { screen: "lesson", stepIndex: 4 } },
  { name: "lesson: next at last step → menu", initial: lessonInitial(), events: Array.from({ length: 5 }, () => ({ kind: "next" as const })), expect: { screen: "menu", index: 0 } },
  { name: "lesson: prev at 0 stays", initial: lessonInitial(), events: [{ kind: "prev" }, { kind: "prev" }], expect: { screen: "lesson", stepIndex: 0 } },
  { name: "lesson: reset", initial: lessonInitial(), events: [{ kind: "next" }, { kind: "next" }, { kind: "reset" }], expect: { screen: "lesson", stepIndex: 0, quizInput: null } },
  { name: "lesson: toggleAuto", initial: lessonInitial(), events: [{ kind: "toggleAuto" }], expect: { screen: "lesson", autoPlay: true } },
  { name: "lesson: mode hex", initial: lessonInitial(), events: [{ kind: "mode", mode: "hex" }], expect: { screen: "lesson", displayMode: "hex" } },
  { name: "lesson: choice without quiz ignored", initial: lessonInitial(), events: [{ kind: "choice", id: "a" }], expect: { screen: "lesson", quizInput: null } },
  {
    name: "lesson: choice on step 5 records",
    initial: lessonInitial(),
    events: [{ kind: "next" }, { kind: "next" }, { kind: "next" }, { kind: "next" }, { kind: "choice", id: "b" }],
    expect: { screen: "lesson", stepIndex: 4, quizInput: "b" },
  },
  {
    name: "lesson: prev after answer clears quizInput",
    initial: lessonInitial(),
    events: [
      { kind: "next" }, { kind: "next" }, { kind: "next" }, { kind: "next" },
      { kind: "choice", id: "b" },
      { kind: "prev" },
    ],
    expect: { screen: "lesson", stepIndex: 3, quizInput: null },
  },

  // ── 画面遷移 ──
  { name: "title: initial", initial: enterTitle(), events: [], expect: { screen: "title", quit: false } },
  { name: "title: enter → menu", initial: enterTitle(), events: [{ kind: "enter" }], expect: { screen: "menu", index: 0 } },
  { name: "title: quit", initial: enterTitle(), events: [{ kind: "quit" }], expect: { screen: "title", quit: true } },
  { name: "menu: down moves index", initial: enterMenu(), events: [{ kind: "down" }, { kind: "down" }], expect: { screen: "menu", index: 2 } },
  { name: "menu: up stops at 0", initial: enterMenu(), events: [{ kind: "up" }, { kind: "up" }], expect: { screen: "menu", index: 0 } },
  { name: "menu: j/k vi-style", initial: enterMenu(), events: [{ kind: "down" }, { kind: "down" }, { kind: "up" }], expect: { screen: "menu", index: 1 } },
  { name: "menu: enter → intro", initial: enterMenu(), events: [{ kind: "enter" }], expect: { screen: "intro" } },
  { name: "menu: quit", initial: enterMenu(), events: [{ kind: "quit" }], expect: { screen: "menu", quit: true } },
  { name: "intro: enter → lesson (step 0)", initial: enterIntro(l0_1), events: [{ kind: "enter" }], expect: { screen: "lesson", stepIndex: 0 } },
  { name: "intro: n → lesson", initial: enterIntro(l0_1), events: [{ kind: "next" }], expect: { screen: "lesson", stepIndex: 0 } },
  { name: "intro: back → menu (same lesson selected)", initial: enterIntro(l0_1), events: [{ kind: "back" }], expect: { screen: "menu", index: 0 } },
  { name: "intro: q → menu", initial: enterIntro(l0_1), events: [{ kind: "quit" }], expect: { screen: "menu", index: 0 } },
  { name: "lesson: q returns to menu", initial: lessonInitial(), events: [{ kind: "quit" }], expect: { screen: "menu" } },
  { name: "lesson: back returns to menu", initial: lessonInitial(), events: [{ kind: "back" }], expect: { screen: "menu" } },
  {
    name: "lesson: back selects current lesson in menu",
    initial: enterLesson(l0_1),
    events: [{ kind: "back" }],
    expect: { screen: "menu", index: 0 },
  },
  { name: "forceQuit from title", initial: enterTitle(), events: [{ kind: "forceQuit" }], expect: { screen: "title", quit: true } },
  { name: "forceQuit from menu", initial: enterMenu(), events: [{ kind: "forceQuit" }], expect: { screen: "menu", quit: true } },
  { name: "forceQuit from lesson", initial: lessonInitial(), events: [{ kind: "forceQuit" }], expect: { screen: "lesson", quit: true } },
];

let failed = 0;
for (const c of cases) {
  let state: AppState = c.initial;
  for (const ev of c.events) state = reduce(state, ev);
  const mismatches: string[] = [];
  for (const [k, v] of Object.entries(c.expect)) {
    const actual = (state as Record<string, unknown>)[k];
    if (actual !== v) mismatches.push(`  ${k}: expected=${JSON.stringify(v)} actual=${JSON.stringify(actual)}`);
  }
  if (mismatches.length > 0) {
    failed++;
    console.log(`FAIL: ${c.name}`);
    for (const m of mismatches) console.log(m);
  } else {
    console.log(`OK  : ${c.name}`);
  }
}

console.log(`\n${failed === 0 ? "ALL PASS" : `${failed} FAIL`}`);
process.exit(failed === 0 ? 0 : 1);

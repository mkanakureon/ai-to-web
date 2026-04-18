// reducer の状態遷移テスト。期待値と一致しなければ exit 1。
// 使い方: npx tsx scripts/reducer-check.ts

import { reduce } from "../src/reduce.js";
import { l0_1 } from "../src/content/l0-1.js";
import type { AppState, KeyEvent } from "../src/types.js";

function initial(): AppState {
  return {
    lesson: l0_1,
    stepIndex: 0,
    displayMode: "binary",
    autoPlay: false,
    quizInput: null,
    quit: false,
  };
}

type Case = { name: string; events: KeyEvent[]; expect: Partial<AppState> };

const cases: Case[] = [
  { name: "initial", events: [], expect: { stepIndex: 0, quit: false, quizInput: null } },
  { name: "next x1", events: [{ kind: "next" }], expect: { stepIndex: 1 } },
  {
    name: "next x4 stops at last step",
    events: [{ kind: "next" }, { kind: "next" }, { kind: "next" }, { kind: "next" }, { kind: "next" }],
    expect: { stepIndex: 4 },
  },
  {
    name: "prev stops at 0",
    events: [{ kind: "prev" }, { kind: "prev" }],
    expect: { stepIndex: 0 },
  },
  {
    name: "next then reset",
    events: [{ kind: "next" }, { kind: "next" }, { kind: "reset" }],
    expect: { stepIndex: 0, quizInput: null },
  },
  {
    name: "quit",
    events: [{ kind: "quit" }],
    expect: { quit: true },
  },
  {
    name: "toggleAuto",
    events: [{ kind: "toggleAuto" }],
    expect: { autoPlay: true },
  },
  {
    name: "mode to hex",
    events: [{ kind: "mode", mode: "hex" }],
    expect: { displayMode: "hex" },
  },
  {
    name: "choice on step-without-quiz is ignored",
    events: [{ kind: "choice", id: "a" }],
    expect: { quizInput: null },
  },
  {
    name: "choice on step 5 (has quiz) records answer",
    events: [
      { kind: "next" }, { kind: "next" }, { kind: "next" }, { kind: "next" },
      { kind: "choice", id: "b" },
    ],
    expect: { stepIndex: 4, quizInput: "b" },
  },
  {
    name: "next after quiz answer clears quizInput",
    events: [
      { kind: "next" }, { kind: "next" }, { kind: "next" }, { kind: "next" },
      { kind: "choice", id: "b" },
      { kind: "prev" },
    ],
    expect: { stepIndex: 3, quizInput: null },
  },
];

let failed = 0;
for (const c of cases) {
  let state = initial();
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

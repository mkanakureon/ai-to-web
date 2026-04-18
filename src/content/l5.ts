// 仕様出典: docs/reports/2026/04/18/05-l1-through-l10-curriculum-spec.md — L5
// Target: ポインタ = アドレスを保持する変数。*p はそのアドレスから読む動作。
import type { Lesson } from "../types.js";

// x は 0x1000、p は 0x2000 に置く。
// 値の表示は L4 と同じ「1 行 = 4 バイト」の流儀。
// x = 42 = 0x0000002A → LE: 0x2A 0x00 0x00 0x00
// p = 0x1000          → LE: 0x00 0x10 0x00 0x00

const MEM_X = { address: "0x1000", value: "0x2A 0x00 0x00 0x00", label: "<x = 42>" };
const MEM_P_HAS_ADDR = { address: "0x2000", value: "0x00 0x10 0x00 0x00", label: "<p = 0x1000>" };

const TARGET_S1 = ["uint32_t x = 42;"];
const TARGET_S2_3 = [
  "uint32_t x = 42;",
  "uint32_t *p = &x;",
];
const TARGET_S4_5 = [
  "uint32_t x = 42;",
  "uint32_t *p = &x;",
  "uint32_t y = *p;",
];

export const l5: Lesson = {
  id: "L5",
  title: "ポインタの正体",
  steps: [
    // Step 1 — x だけを見る
    {
      target: { title: "Pointer", lines: TARGET_S1 },
      representation: {
        items: [
          { label: "x", value: "42" },
          { label: "&x", value: "0x1000" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [{ ...MEM_X }],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "x は普通の uint32_t 変数。",
          "メモリ 0x1000 番地に 4 バイト分の値 42 が置かれる。",
        ],
      },
    },
    // Step 2 — ポインタ p を追加
    {
      target: { title: "Pointer", lines: TARGET_S2_3 },
      representation: {
        items: [
          { label: "x", value: "42" },
          { label: "&x", value: "0x1000" },
          { label: "p", value: "0x1000  (= &x)" },
          { label: "&p", value: "0x2000" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [{ ...MEM_X }, { ...MEM_P_HAS_ADDR }],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "ポインタ変数 p を追加。p も 4 バイトの変数で、別の番地 0x2000 に置かれる。",
          "ただし p の中身は「値」ではなく「x の番地 = 0x1000」。",
        ],
      },
    },
    // Step 3 — p は「番地を保持する変数」
    {
      target: { title: "Pointer", lines: TARGET_S2_3, highlightLine: 1 },
      representation: {
        items: [
          { label: "p のメモリ位置", value: "0x2000" },
          { label: "p の中身", value: "0x1000" },
          { label: "意味", value: "p は x を指している" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [{ ...MEM_X }, { ...MEM_P_HAS_ADDR, selected: true }],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "ポインタの正体: アドレス (番地) を保持する変数。",
          "p 自体は 0x2000 に置かれ、その中身 0x1000 は x の位置を示す。",
          "「p は x を指している」と表現する。",
        ],
      },
    },
    // Step 4 — *p でデリファレンス: p の中身を番地として読む
    {
      target: { title: "Pointer", lines: TARGET_S4_5, highlightLine: 2 },
      representation: {
        items: [
          { label: "p の中身", value: "0x1000" },
          { label: "*p = mem[0x1000]", value: "42" },
          { label: "y", value: "42" },
        ],
      },
      cpuBusMemory: {
        mar: "0x1000",
        mdr: "0x0000002A",
        addressBusValue: "0x1000",
        dataBusValue: "0x0000002A",
        memoryCells: [
          { ...MEM_X, selected: true },
          { ...MEM_P_HAS_ADDR },
        ],
        phase: "done",
      },
      explainQuiz: {
        explanationLines: [
          "*p は「p の中身 (0x1000) を番地として、そこの値を読む」。",
          "CPU は MAR = 0x1000 を出し、MDR に 0x2A (= 42) を受け取る。",
          "結果、y = 42。"
        ],
      },
    },
    // Step 5 — Quiz
    {
      target: { title: "Pointer", lines: TARGET_S4_5 },
      representation: {
        items: [
          { label: "p", value: "アドレスを保持する変数" },
          { label: "*p", value: "p の中身を番地として読んだ値" },
          { label: "&x", value: "x のアドレスを取得" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [{ ...MEM_X }, { ...MEM_P_HAS_ADDR }],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "ポインタ自体は 1 つのメモリ位置に置かれ、その中身が「別の場所の番地」。",
          "番地を辿ってメモリを読むのが * (デリファレンス)。",
        ],
        quiz: {
          question: "uint32_t *p = &x; のとき、p に入っているのは?",
          choices: [
            { id: "a", text: "x の値 (42) のコピー" },
            { id: "b", text: "x が置かれた番地 (アドレス)" },
            { id: "c", text: "関数への参照" },
          ],
          correctId: "b",
        },
      },
    },
  ],
};

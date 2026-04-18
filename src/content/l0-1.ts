// 仕様出典: docs/reports/2026/04/18/04-l0-curriculum-spec.md — L0-1
import type { Lesson } from "../types.js";

const BASE_MEMORY = [
  { address: "0x0FFC", value: "0x10" },
  { address: "0x1000", value: "0x41" },
  { address: "0x1004", value: "0x42" },
];

export const l0_1: Lesson = {
  id: "L0-1",
  title: "2進数とビット",
  intro: {
    objective: "同じ 1 バイト (値 65) が 10進・2進・16進・文字という 4 つの顔を持つことを観察する。",
    overview: [
      "コンピューターがメモリに保持しているのは 0/1 のビットの並びだけ。そこに「意味」を与えているのは、それを読むプログラムの解釈。",
      "人間にとって同じ「65」という値も、見方を変えると「01000001」「0x41」「'A'」になる。このレッスンではその 4 つの顔を並べて見る。",
    ],
    terms: [
      { term: "ビット (bit)", description: "0 か 1 を取る最小単位。8 bit = 1 byte。" },
      { term: "ASCII", description: "文字と数値 (0〜127) の対応表。'A' = 65 = 0x41。" },
      { term: "16進数 (hex)", description: "0〜9 と A〜F の 16 文字で表記する。1 桁 = 4 bit、2 桁 = 1 byte。" },
    ],
    firstStepHint: "このあと: 値 65 から始めて、2進 → ビット位置 → 16進 → 文字 と並んでいきます。",
  },
  steps: [
    // Step 1 — 10進数を見る
    {
      target: {
        title: "Value",
        lines: ["Value: 65"],
      },
      representation: {
        items: [{ label: "Decimal", value: "65" }],
      },
      cpuBusMemory: {
        memoryCells: BASE_MEMORY,
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "これから 65 という 1 バイトの値を観察します。",
          "同じ値が複数の顔を持ちます。",
        ],
      },
    },
    // Step 2 — 2進数を並べる
    {
      target: {
        title: "Value",
        lines: ["Value: 65"],
      },
      representation: {
        items: [
          { label: "Decimal", value: "65" },
          { label: "Binary", value: "01000001" },
        ],
      },
      cpuBusMemory: {
        memoryCells: BASE_MEMORY,
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "これが 2 進数の姿。8 個の 0/1 が 1 バイトです。",
        ],
      },
    },
    // Step 3 — ビット位置を示す
    {
      target: {
        title: "Value",
        lines: [
          "Value: 65",
          "Bit:  7 6 5 4 3 2 1 0",
          "Val:  0 1 0 0 0 0 0 1",
        ],
        highlightLine: 2,
      },
      representation: {
        items: [
          { label: "Decimal", value: "65" },
          { label: "Binary", value: "01000001" },
        ],
      },
      cpuBusMemory: {
        memoryCells: BASE_MEMORY,
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "右端がビット 0（1 の位）、左端がビット 7。",
          "各桁の重みは 2 の累乗です。",
        ],
      },
    },
    // Step 4 — 16進数を並べる
    {
      target: {
        title: "Value",
        lines: [
          "Value: 65",
          "Bit:  7 6 5 4 3 2 1 0",
          "Val:  0 1 0 0 0 0 0 1",
        ],
      },
      representation: {
        items: [
          { label: "Decimal", value: "65" },
          { label: "Binary", value: "01000001" },
          { label: "Hex", value: "0x41" },
        ],
      },
      cpuBusMemory: {
        memoryCells: BASE_MEMORY,
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "4 ビットずつまとめると 16 進数になります。",
          "0100 → 4、0001 → 1、合わせて 0x41。",
        ],
      },
    },
    // Step 5 — 文字の意味を示す + Quiz
    {
      target: {
        title: "Value",
        lines: [
          "Value: 65",
          "Bit:  7 6 5 4 3 2 1 0",
          "Val:  0 1 0 0 0 0 0 1",
        ],
      },
      representation: {
        items: [
          { label: "Decimal", value: "65" },
          { label: "Binary", value: "01000001" },
          { label: "Hex", value: "0x41" },
          { label: "Char", value: "'A'" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [
          { address: "0x0FFC", value: "0x10" },
          { address: "0x1000", value: "0x41", label: "'A'", selected: true },
          { address: "0x1004", value: "0x42" },
        ],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "ASCII コード表で 65 は 'A'。",
          "同じ 1 バイトが 10/2/16 進と文字、4 つの顔を持ちます。",
        ],
        quiz: {
          question: "1 バイトは何ビットですか?",
          choices: [
            { id: "a", text: "4" },
            { id: "b", text: "8" },
            { id: "c", text: "16" },
          ],
          correctId: "b",
        },
      },
    },
  ],
};

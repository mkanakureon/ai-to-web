// 仕様出典: docs/reports/2026/04/18/05-l1-through-l10-curriculum-spec.md — L6
// Target: struct のフィールドがメモリ上で宣言順に連続配置される
// (L7 で padding を扱うため、L6 は padding が発生しない char + char に限定)
import type { Lesson } from "../types.js";

const TARGET_LINES = [
  "struct Pair {",
  "  char a;",
  "  char b;",
  "} s = { 'X', 'Y' };",
];

export const l6: Lesson = {
  id: "L6",
  title: "struct とメモリ配置",
  intro: {
    objective: "struct のフィールドが宣言順にメモリへ連続配置されることを、型が揃った最小例で観察する。",
    overview: [
      "struct は複数のフィールドを 1 つの型にまとめる仕組み。メモリ上では宣言順に各フィールドが並ぶ。",
      "型が揃っていれば隙間なく並ぶ。型が混在したときの挙動は L7 で扱う。",
    ],
    terms: [
      { term: "struct", description: "複数フィールドをまとめた複合型。C の基本データ構造。" },
      { term: "フィールド (field)", description: "struct 内の各要素。名前と型を持つ。" },
      { term: "sizeof(struct)", description: "struct 全体が占めるバイト数。フィールドの合計 + padding (L7 参照)。" },
    ],
    firstStepHint: "このあと: char a; char b; の 2 フィールドを宣言し、メモリに 2 バイト連続で並ぶ様子を見ます。",
  },
  steps: [
    // Step 1 — struct 定義を見る
    {
      target: { title: "Struct", lines: TARGET_LINES },
      representation: {
        items: [
          { label: "fields", value: "a, b (char each)" },
          { label: "init", value: "{ 'X', 'Y' }" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [
          { address: "0x1000", value: "??", label: "<s.a>" },
          { address: "0x1001", value: "??", label: "<s.b>" },
        ],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "struct Pair は 2 つのフィールド a, b をまとめた型。",
          "s はその struct 型の変数。",
        ],
      },
    },
    // Step 2 — 各フィールドの ASCII コード
    {
      target: { title: "Struct", lines: TARGET_LINES },
      representation: {
        items: [
          { label: "s.a", value: "'X' = 0x58" },
          { label: "s.b", value: "'Y' = 0x59" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [
          { address: "0x1000", value: "??", label: "<s.a>" },
          { address: "0x1001", value: "??", label: "<s.b>" },
        ],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "各フィールドの中身は ASCII 1 バイト。",
          "'X' = 0x58, 'Y' = 0x59。",
        ],
      },
    },
    // Step 3 — メモリに配置
    {
      target: { title: "Struct", lines: TARGET_LINES },
      representation: {
        items: [
          { label: "s.a", value: "0x58" },
          { label: "s.b", value: "0x59" },
          { label: "&s.a", value: "0x1000" },
          { label: "&s.b", value: "0x1001" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [
          { address: "0x1000", value: "0x58", label: "<s.a = 'X'>" },
          { address: "0x1001", value: "0x59", label: "<s.b = 'Y'>" },
        ],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "struct のフィールドは、宣言順にメモリへ連続配置されます。",
          "a が先 (0x1000)、b が次 (0x1001)。間に隙間はない。",
        ],
      },
    },
    // Step 4 — sizeof(s) を明示
    {
      target: { title: "Struct", lines: TARGET_LINES },
      representation: {
        items: [
          { label: "s.a", value: "0x58 @ 0x1000" },
          { label: "s.b", value: "0x59 @ 0x1001" },
          { label: "sizeof(s)", value: "2 bytes" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [
          { address: "0x1000", value: "0x58", label: "<s.a = 'X'>", selected: true },
          { address: "0x1001", value: "0x59", label: "<s.b = 'Y'>", selected: true },
        ],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "sizeof(s) は struct 全体のバイト数。",
          "この例は char + char = 1 + 1 = 2 バイト (連続)。",
          "— 型が揃っているので隙間は生じない。L7 では隙間の例を見ます。",
        ],
      },
    },
    // Step 5 — Quiz
    {
      target: { title: "Struct", lines: TARGET_LINES },
      representation: {
        items: [
          { label: "rule", value: "fields = 宣言順に連続配置" },
          { label: "char + char", value: "1 + 1 = 2 bytes (隙間なし)" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [
          { address: "0x1000", value: "0x58", label: "<s.a = 'X'>" },
          { address: "0x1001", value: "0x59", label: "<s.b = 'Y'>" },
        ],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "struct は複数フィールドが宣言順にメモリに並ぶ、という最小ルール。",
          "型が揃っていれば sizeof = 単純な合計。",
        ],
        quiz: {
          question: "struct { char a; char b; } s; のとき sizeof(s) は?",
          choices: [
            { id: "a", text: "1" },
            { id: "b", text: "2" },
            { id: "c", text: "4" },
          ],
          correctId: "b",
        },
      },
    },
  ],
};

// 仕様出典: docs/reports/2026/04/18/05-l1-through-l10-curriculum-spec.md — L7
// Target: 型が混在した struct では alignment のため padding が挿入される
// L6 (char + char = 2バイト) の反例として、char + uint32_t で 8 バイトになる例を見る
import type { Lesson, MemoryCell } from "../types.js";

const TARGET_LINES = [
  "struct {",
  "  char     a;",
  "  uint32_t b;",
  "} s = { 'X', 42 };",
];

// s.a = 'X' = 0x58
// padding (3 bytes) — 中身は undefined 扱い
// s.b = 42 = 0x0000002A → LE: 0x2A 0x00 0x00 0x00

function memoryWithoutPadding(): MemoryCell[] {
  return [
    { address: "0x1000", value: "0x58", label: "<s.a = 'X'>" },
    { address: "0x1001", value: "0x2A", label: "<s.b[0]? >" },
    { address: "0x1002", value: "0x00", label: "<s.b[1]? >" },
    { address: "0x1003", value: "0x00", label: "<s.b[2]? >" },
    { address: "0x1004", value: "0x00", label: "<s.b[3]? >" },
  ];
}

function memoryWithPadding(highlightPad = false, highlightB = false): MemoryCell[] {
  return [
    { address: "0x1000", value: "0x58", label: "<s.a = 'X'>" },
    { address: "0x1001", value: "0x??", label: "<pad>", dim: true, selected: highlightPad },
    { address: "0x1002", value: "0x??", label: "<pad>", dim: true, selected: highlightPad },
    { address: "0x1003", value: "0x??", label: "<pad>", dim: true, selected: highlightPad },
    { address: "0x1004", value: "0x2A", label: "<s.b[0]>", selected: highlightB },
    { address: "0x1005", value: "0x00", label: "<s.b[1]>", selected: highlightB },
    { address: "0x1006", value: "0x00", label: "<s.b[2]>", selected: highlightB },
    { address: "0x1007", value: "0x00", label: "<s.b[3]>", selected: highlightB },
  ];
}

export const l7: Lesson = {
  id: "L7",
  title: "パディング (alignment)",
  intro: {
    objective: "混合型の struct で CPU のアライメント要件のため見えない padding バイトが挿入され、sizeof が単純合計より大きくなる様子を観察する。",
    overview: [
      "CPU は 4 バイトの値を 4 の倍数のアドレスから読みたがる (自然な境界 / natural alignment)。",
      "そのため char (1 byte) の直後に int (4 bytes) を置くと、char の後に 3 バイトの padding が挿入される。単純合計が 5 なのに sizeof が 8 になる理由。",
    ],
    terms: [
      { term: "alignment (境界)", description: "型ごとに決められた「好ましい先頭アドレス」。int なら 4 の倍数。" },
      { term: "padding", description: "alignment を満たすため挿入される見えないバイト。中身は不定。" },
      { term: "natural alignment", description: "型のサイズと同じ倍数に揃えるのが基本。uint32 → 4、uint64 → 8。" },
    ],
    firstStepHint: "このあと: char + uint32 の struct で、単純合計 5 バイトに対し sizeof が 8 になる様子を見ます。",
  },
  steps: [
    // Step 1 — 単純に連続配置したら?
    {
      target: { title: "Struct with mixed types", lines: TARGET_LINES },
      representation: {
        items: [
          { label: "a", value: "char = 1 byte" },
          { label: "b", value: "uint32_t = 4 bytes" },
          { label: "単純合計", value: "1 + 4 = 5 bytes?" },
        ],
      },
      cpuBusMemory: {
        memoryCells: memoryWithoutPadding(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "L6 の考え方なら、char(1) + uint32_t(4) = 5 バイトのはず。",
          "でも実際は違う。理由は CPU の読み方。",
        ],
      },
    },
    // Step 2 — sizeof は実は 8
    {
      target: { title: "Struct with mixed types", lines: TARGET_LINES },
      representation: {
        items: [
          { label: "a", value: "1 byte" },
          { label: "b", value: "4 bytes" },
          { label: "単純合計", value: "5 bytes" },
          { label: "実際の sizeof(s)", value: "8 bytes!" },
          { label: "差分", value: "+3 bytes (padding)" },
        ],
      },
      cpuBusMemory: {
        memoryCells: memoryWithPadding(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "sizeof(s) は実測すると 8 バイト。単純合計より 3 バイト多い。",
          "メモリに見えない 3 バイト (padding) が挿入されている。",
        ],
      },
    },
    // Step 3 — padding の位置を強調
    {
      target: { title: "Struct with mixed types", lines: TARGET_LINES },
      representation: {
        items: [
          { label: "&s.a", value: "0x1000 (1 byte)" },
          { label: "padding", value: "0x1001..0x1003 (3 bytes)" },
          { label: "&s.b", value: "0x1004 (4 bytes)" },
          { label: "sizeof(s)", value: "8 bytes" },
        ],
      },
      cpuBusMemory: {
        memoryCells: memoryWithPadding(true, false),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "a の後ろ (0x1001〜0x1003) に padding が 3 バイト入る。",
          "結果、b の開始位置が 0x1004 = 4 の倍数に揃う。",
        ],
      },
    },
    // Step 4 — なぜ padding が必要か
    {
      target: { title: "Struct with mixed types", lines: TARGET_LINES },
      representation: {
        items: [
          { label: "b の開始", value: "0x1004 = 4 の倍数" },
          { label: "4 の倍数とは", value: "CPU が uint32_t を一気に読める境界" },
          { label: "padding なしなら", value: "b が 0x1001 — 4 の倍数でない → 非効率 or エラー" },
        ],
      },
      cpuBusMemory: {
        memoryCells: memoryWithPadding(false, true),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "CPU は uint32_t (4 バイト) を 4 の倍数アドレスから読むのが速い (= alignment)。",
          "padding はそのための隙間。これにより b = 0x1004 から読める。",
          "一部の CPU では境界違反でクラッシュするので、最適化ではなく正しさの話でもある。",
        ],
      },
    },
    // Step 5 — Quiz
    {
      target: { title: "Struct with mixed types", lines: TARGET_LINES },
      representation: {
        items: [
          { label: "構造", value: "a (1) + pad (3) + b (4) = 8" },
          { label: "規則", value: "各型は自然な境界 (size の倍数) に揃う" },
          { label: "L6 との違い", value: "L6 は char + char で揃っていた" },
        ],
      },
      cpuBusMemory: {
        memoryCells: memoryWithPadding(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "混合した型の struct では、CPU の alignment 要件を満たすため padding が入る。",
          "「フィールド宣言順」ルールは守られるが、隙間が挟まる。",
        ],
        quiz: {
          question: "struct { char a; uint32_t b; }; の sizeof (一般的な 64bit 環境) は?",
          choices: [
            { id: "a", text: "5" },
            { id: "b", text: "8" },
            { id: "c", text: "4" },
          ],
          correctId: "b",
        },
      },
    },
  ],
};

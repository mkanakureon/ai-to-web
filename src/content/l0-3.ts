// 仕様出典: docs/reports/2026/04/18/04-l0-curriculum-spec.md — L0-3
import type { Lesson, MemoryCell } from "../types.js";

const DEFAULT_KEY_HINTS = ["[n]next", "[p]prev", "[q]quit"];

function baseMemory(): MemoryCell[] {
  return [
    { address: "0x0FFC", value: "0x10" },
    { address: "0x1000", value: "0x41" },
    { address: "0x1004", value: "0x42" },
  ];
}

export const l0_3: Lesson = {
  id: "L0-3",
  title: "メモリアクセスと C の接続",
  steps: [
    // Step 1 — ソースを見る
    {
      target: {
        title: "C Source",
        lines: ["char x = 'A';", "print(x);"],
      },
      representation: {
        items: [{ label: "Source", value: "char x" }],
      },
      cpuBusMemory: {
        memoryCells: baseMemory(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "C のコードを 1 バイトレベルで追いかけます。",
          "x は名前、実体はメモリの中にあります。",
        ],
        keyHints: DEFAULT_KEY_HINTS,
      },
    },
    // Step 2 — x の場所を示す
    {
      target: {
        title: "C Source",
        lines: ["char x = 'A';", "print(x);"],
      },
      representation: {
        items: [
          { label: "Source", value: "char x" },
          { label: "x address", value: "0x1000" },
          { label: "x value", value: "0x41" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [
          { address: "0x0FFC", value: "0x10" },
          { address: "0x1000", value: "0x41", label: "<x>" },
          { address: "0x1004", value: "0x42" },
        ],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "x は名前です。",
          "実体はメモリの 0x1000 番地にある 1 バイト 0x41。",
        ],
        keyHints: DEFAULT_KEY_HINTS,
      },
    },
    // Step 3 — print(x) が CPU に読み取りを頼む
    {
      target: {
        title: "C Source",
        lines: ["char x = 'A';", "print(x);"],
        highlightLine: 1,
      },
      representation: {
        items: [
          { label: "Source", value: "print(x)" },
          { label: "x address", value: "0x1000" },
          { label: "x value", value: "0x41" },
        ],
      },
      cpuBusMemory: {
        mar: "0x1000",
        addressBusValue: "0x1000",
        memoryCells: [
          { address: "0x0FFC", value: "0x10" },
          { address: "0x1000", value: "0x41", label: "<x>" },
          { address: "0x1004", value: "0x42" },
        ],
        phase: "send-address",
      },
      explainQuiz: {
        explanationLines: [
          "print(x) は x を渡すために、まず中身を読みます。",
          "L0-2 と同じ手順で、CPU が 0x1000 を Address Bus に流します。",
        ],
        keyHints: DEFAULT_KEY_HINTS,
      },
    },
    // Step 4 — Data Bus で値が返り MDR に入る
    {
      target: {
        title: "C Source",
        lines: ["char x = 'A';", "print(x);"],
        highlightLine: 1,
      },
      representation: {
        items: [
          { label: "Source", value: "print(x)" },
          { label: "x address", value: "0x1000" },
          { label: "x value", value: "0x41" },
        ],
      },
      cpuBusMemory: {
        mar: "0x1000",
        mdr: "0x41",
        addressBusValue: "0x1000",
        dataBusValue: "0x41",
        memoryCells: [
          { address: "0x0FFC", value: "0x10" },
          { address: "0x1000", value: "0x41", label: "<x>", selected: true },
          { address: "0x1004", value: "0x42" },
        ],
        phase: "done",
      },
      explainQuiz: {
        explanationLines: [
          "CPU は 0x41 を受け取りました。",
          "この値は ASCII で 'A'。",
        ],
        keyHints: DEFAULT_KEY_HINTS,
      },
    },
    // Step 5 — 出力される + Quiz
    {
      target: {
        title: "C Source",
        lines: ["char x = 'A';", "print(x);", "", "Output: A"],
        highlightLine: 3,
      },
      representation: {
        items: [
          { label: "Source", value: "print(x)" },
          { label: "x address", value: "0x1000" },
          { label: "x value", value: "0x41" },
          { label: "Char", value: "'A'" },
        ],
      },
      cpuBusMemory: {
        mar: "0x1000",
        mdr: "0x41",
        addressBusValue: "0x1000",
        dataBusValue: "0x41",
        memoryCells: [
          { address: "0x0FFC", value: "0x10" },
          { address: "0x1000", value: "0x41", label: "<x>", selected: true },
          { address: "0x1004", value: "0x42" },
        ],
        phase: "done",
      },
      explainQuiz: {
        explanationLines: [
          "x は名前、実体はメモリ上の 0x41、",
          "読むときは CPU がアドレスを指定する。",
          "C の 2 行はこの一連の動きです。",
        ],
        keyHints: [...DEFAULT_KEY_HINTS, "[a/b/c]answer"],
        quiz: {
          question: "`char x = 'A'` で作られた x の正体は次のどれに近いですか?",
          choices: [
            { id: "a", text: "'A' という文字そのもの" },
            { id: "b", text: "メモリ上のある番地に置かれた 1 バイト (0x41)" },
            { id: "c", text: "CPU のレジスタに永続的に置かれた値" },
          ],
          correctId: "b",
        },
      },
    },
  ],
};

// 仕様出典: docs/reports/2026/04/18/04-l0-curriculum-spec.md — L0-2
import type { Lesson, MemoryCell } from "../types.js";

function baseMemory(): MemoryCell[] {
  return [
    { address: "0x0FFC", value: "0x10" },
    { address: "0x1000", value: "0x41" },
    { address: "0x1004", value: "0x42" },
  ];
}

export const l0_2: Lesson = {
  id: "L0-2",
  title: "CPU / メモリ / バス",
  intro: {
    objective: "CPU がメモリの特定の番地から 1 バイトを読み取る 1 サイクル (MAR → Address Bus → 選択 → Data Bus → MDR) を段階的に観察する。",
    overview: [
      "メモリに置かれた値を CPU が使うには、まず番地を指定して取りに行く必要がある。この「読み取り 1 回分」がこれから学ぶすべての基礎動作。",
      "アドレス用のバスとデータ用のバスが、それぞれ別方向に情報を運ぶことを見る。",
    ],
    terms: [
      { term: "CPU", description: "レジスタを持ち、メモリから値を取り出して演算する装置。" },
      { term: "MAR (Memory Address Register)", description: "CPU が読みたい番地を一時的に置くレジスタ。" },
      { term: "MDR (Memory Data Register)", description: "メモリから返ってきた値を受け取るレジスタ。" },
      { term: "Address Bus / Data Bus", description: "CPU ↔ メモリ 間で、アドレスと値をそれぞれ運ぶ配線。" },
    ],
    firstStepHint: "このあと: 0x1000 番地の値を読む手順を 5 ステップに分けて見ます。",
  },
  steps: [
    // Step 1 — ゴール提示
    {
      target: {
        title: "Goal",
        lines: ["read memory at 0x1000"],
      },
      representation: {
        items: [{ label: "Address", value: "0x1000" }],
      },
      cpuBusMemory: {
        memoryCells: baseMemory(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "アドレス 0x1000 の値を読みに行きます。",
          "登場するのは CPU、バス、メモリの 3 つ。",
        ],
      },
    },
    // Step 2 — CPU が MAR にアドレスを入れる
    {
      target: {
        title: "Goal",
        lines: ["read memory at 0x1000"],
      },
      representation: {
        items: [{ label: "Address", value: "0x1000" }],
      },
      cpuBusMemory: {
        mar: "0x1000",
        addressBusValue: "0x1000",
        memoryCells: baseMemory(),
        phase: "send-address",
      },
      explainQuiz: {
        explanationLines: [
          "CPU は MAR (Memory Address Register) に読みたい番地を置きます。",
          "MAR = 0x1000。Address Bus に流れて、メモリへ届きます。",
        ],
      },
    },
    // Step 3 — メモリセルが選ばれる
    {
      target: {
        title: "Goal",
        lines: ["read memory at 0x1000"],
      },
      representation: {
        items: [
          { label: "Address", value: "0x1000" },
          { label: "Data", value: "0x41" },
        ],
      },
      cpuBusMemory: {
        mar: "0x1000",
        addressBusValue: "0x1000",
        memoryCells: [
          { address: "0x0FFC", value: "0x10" },
          { address: "0x1000", value: "0x41", selected: true },
          { address: "0x1004", value: "0x42" },
        ],
        phase: "select-memory",
      },
      explainQuiz: {
        explanationLines: [
          "Address Bus で届いた番地をメモリがデコードし、",
          "0x1000 のセルが選ばれます。中身は 0x41。",
        ],
      },
    },
    // Step 4 — Data Bus で値が返る
    {
      target: {
        title: "Goal",
        lines: ["read memory at 0x1000"],
      },
      representation: {
        items: [
          { label: "Address", value: "0x1000" },
          { label: "Data", value: "0x41" },
        ],
      },
      cpuBusMemory: {
        mar: "0x1000",
        addressBusValue: "0x1000",
        dataBusValue: "0x41",
        memoryCells: [
          { address: "0x0FFC", value: "0x10" },
          { address: "0x1000", value: "0x41", selected: true },
          { address: "0x1004", value: "0x42" },
        ],
        phase: "return-data",
      },
      explainQuiz: {
        explanationLines: [
          "選ばれたセルは Data Bus に値を載せて CPU に返します。",
          "向きは メモリ → CPU。",
        ],
      },
    },
    // Step 5 — MDR で受け取る + Quiz
    {
      target: {
        title: "Goal",
        lines: ["read memory at 0x1000"],
      },
      representation: {
        items: [
          { label: "Address", value: "0x1000" },
          { label: "Data", value: "0x41" },
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
          { address: "0x1000", value: "0x41", selected: true },
          { address: "0x1004", value: "0x42" },
        ],
        phase: "done",
      },
      explainQuiz: {
        explanationLines: [
          "CPU は MDR (Memory Data Register) に値を受け取ります。",
          "MDR = 0x41 = 'A'。読み取り 1 回の完了です。",
        ],
        quiz: {
          question: "メモリ読み取りで、CPU が最初に出すのはどれですか?",
          choices: [
            { id: "a", text: "Data Bus に値を流す" },
            { id: "b", text: "Address Bus にアドレスを流す" },
            { id: "c", text: "MDR に値を受け取る" },
          ],
          correctId: "b",
        },
      },
    },
  ],
};

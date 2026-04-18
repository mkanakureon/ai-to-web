// 仕様出典: docs/reports/2026/04/18/05-l1-through-l10-curriculum-spec.md — L4
// Target: 配列アクセス arr[i] = ベースアドレス + i * sizeof(要素) のメモリ読み取り
import type { Lesson } from "../types.js";

// L4 は「配列要素ごとのアドレス計算」を見せるのが主眼なので、
// 各要素 (4バイト) をメモリビュー上で 1 行にまとめて表示する。
// L1 のバイト単位表示 (各バイト = 1 セル) とは流儀を変えているが、
// L4 の教材目的に合わせた意図的な選択。

const TARGET_S1_2 = ["uint32_t arr[3] = {10, 20, 30};"];
const TARGET_S3_5 = [
  "uint32_t arr[3] = {10, 20, 30};",
  "uint32_t x = arr[1];",
];

function baseArrayMemory() {
  return [
    { address: "0x1000", value: "0x0A 0x00 0x00 0x00", label: "<arr[0] = 10>" },
    { address: "0x1004", value: "0x14 0x00 0x00 0x00", label: "<arr[1] = 20>" },
    { address: "0x1008", value: "0x1E 0x00 0x00 0x00", label: "<arr[2] = 30>" },
  ];
}

export const l4: Lesson = {
  id: "L4",
  title: "配列とポインタ",
  intro: {
    objective: "配列アクセス arr[i] が「ベースアドレス + i × sizeof(要素)」のアドレス計算 + 読み取りであることを観察する。",
    overview: [
      "配列は特別な機能ではなく、連続したメモリ領域にすぎない。arr[i] の [ ] 記号の裏では掛け算と足し算でアドレスを計算し、L0-2 と同じ手順でメモリから値を取ってくる。",
      "要素の幅 (sizeof) が違えば、インデックスごとのジャンプ幅も変わる。",
    ],
    terms: [
      { term: "ベースアドレス", description: "配列の先頭 (arr[0]) が置かれている番地。" },
      { term: "sizeof(要素)", description: "1 要素のバイト幅。uint32_t なら 4。" },
      { term: "アドレス計算", description: "&arr[i] = &arr[0] + i × sizeof(要素)。配列アクセスの本質。" },
    ],
    firstStepHint: "このあと: arr[3] を用意して、arr[1] の番地がどう計算されるかを式と CPU の動きで見ます。",
  },
  steps: [
    // Step 1 — 配列の宣言と値
    {
      target: { title: "Array", lines: TARGET_S1_2 },
      representation: {
        items: [
          { label: "arr[0]", value: "10" },
          { label: "arr[1]", value: "20" },
          { label: "arr[2]", value: "30" },
        ],
      },
      cpuBusMemory: {
        memoryCells: baseArrayMemory(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "uint32_t の配列。各要素は 4 バイト幅。",
          "メモリ上に 3 要素 × 4 = 12 バイトが連続して並ぶ。",
        ],
      },
    },
    // Step 2 — 各要素のアドレス
    {
      target: { title: "Array", lines: TARGET_S1_2 },
      representation: {
        items: [
          { label: "arr[0]", value: "10" },
          { label: "arr[1]", value: "20" },
          { label: "arr[2]", value: "30" },
          { label: "&arr[0]", value: "0x1000" },
          { label: "&arr[1]", value: "0x1004" },
          { label: "&arr[2]", value: "0x1008" },
        ],
      },
      cpuBusMemory: {
        memoryCells: baseArrayMemory(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "各要素の先頭アドレスは、隣との差が sizeof(uint32_t) = 4。",
          "これが 4 バイト刻みになる理由。",
        ],
      },
    },
    // Step 3 — arr[1] アクセスのアドレス計算
    {
      target: { title: "Array", lines: TARGET_S3_5, highlightLine: 1 },
      representation: {
        items: [
          { label: "base", value: "&arr[0] = 0x1000" },
          { label: "index", value: "1" },
          { label: "elem size", value: "sizeof(uint32_t) = 4" },
          { label: "calc", value: "0x1000 + 1 × 4 = 0x1004" },
          { label: "&arr[1]", value: "0x1004" },
        ],
      },
      cpuBusMemory: {
        memoryCells: baseArrayMemory(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "arr[1] の場所を計算します。",
          "ベースアドレス + インデックス × 要素サイズ = 0x1000 + 1 × 4 = 0x1004。",
        ],
      },
    },
    // Step 4 — CPU が 0x1004 を読む
    {
      target: { title: "Array", lines: TARGET_S3_5, highlightLine: 1 },
      representation: {
        items: [
          { label: "&arr[1]", value: "0x1004" },
          { label: "bytes", value: "0x14 0x00 0x00 0x00" },
          { label: "as uint32", value: "0x00000014 = 20" },
        ],
      },
      cpuBusMemory: {
        mar: "0x1004",
        mdr: "0x00000014",
        addressBusValue: "0x1004",
        dataBusValue: "0x00000014",
        memoryCells: [
          { address: "0x1000", value: "0x0A 0x00 0x00 0x00", label: "<arr[0] = 10>" },
          { address: "0x1004", value: "0x14 0x00 0x00 0x00", label: "<arr[1] = 20>", selected: true },
          { address: "0x1008", value: "0x1E 0x00 0x00 0x00", label: "<arr[2] = 30>" },
        ],
        phase: "done",
      },
      explainQuiz: {
        explanationLines: [
          "CPU は MAR=0x1004 を Address Bus に出し、",
          "4 バイトを Data Bus で受け取って MDR に入れる。",
          "MDR = 0x00000014 = 20。",
        ],
      },
    },
    // Step 5 — Quiz
    {
      target: { title: "Array", lines: TARGET_S3_5 },
      representation: {
        items: [
          { label: "rule", value: "&arr[i] = base + i × sizeof(elem)" },
          { label: "base", value: "0x1000" },
          { label: "elem size", value: "4 bytes" },
          { label: "hint", value: "i=2 なら base + 8" },
        ],
      },
      cpuBusMemory: {
        memoryCells: baseArrayMemory(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "配列アクセスは アドレス計算 + メモリ読み取り。",
          "インデックスを 1 増やすと、アドレスは sizeof(要素) だけ進む。",
        ],
        quiz: {
          question: "uint32_t arr[3] で &arr[0] = 0x1000 のとき、&arr[2] は?",
          choices: [
            { id: "a", text: "0x1002" },
            { id: "b", text: "0x1008" },
            { id: "c", text: "0x100C" },
          ],
          correctId: "b",
        },
      },
    },
  ],
};

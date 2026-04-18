// 仕様出典: docs/reports/2026/04/18/05-l1-through-l10-curriculum-spec.md — L2
// Target: 2 バイト値 0x1234 が Big/Little Endian でメモリにどう並ぶかを対比観察する
import type { Lesson } from "../types.js";

const TARGET_LINES = ["uint16_t n = 0x1234;"];

export const l2: Lesson = {
  id: "L2",
  title: "エンディアン",
  steps: [
    // Step 1 — 値とバイトの内訳（メモリ配置はまだ未定）
    {
      target: { title: "16-bit value", lines: TARGET_LINES },
      representation: {
        items: [
          { label: "value", value: "0x1234" },
          { label: "high", value: "0x12" },
          { label: "low", value: "0x34" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [
          { address: "0x1000", value: "??", label: "<n[0]>" },
          { address: "0x1001", value: "??", label: "<n[1]>" },
        ],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "2 バイトの値 0x1234 を high=0x12 と low=0x34 に分けます。",
          "メモリのどちらの番地に high と low を置くか? 2 通りあります。",
        ],
      },
    },
    // Step 2 — Big Endian 配置
    {
      target: { title: "16-bit value", lines: TARGET_LINES },
      representation: {
        items: [
          { label: "value", value: "0x1234" },
          { label: "high", value: "0x12" },
          { label: "low", value: "0x34" },
          { label: "BE", value: "[0x1000=0x12][0x1001=0x34]" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [
          { address: "0x1000", value: "0x12", label: "<high>" },
          { address: "0x1001", value: "0x34", label: "<low>" },
        ],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "Big Endian: 高位バイトを低アドレスに置く。",
          "人間が数を書く順 (1234) と同じで、[high=0x12][low=0x34] と並ぶ。",
        ],
      },
    },
    // Step 3 — Little Endian 配置
    {
      target: { title: "16-bit value", lines: TARGET_LINES },
      representation: {
        items: [
          { label: "value", value: "0x1234" },
          { label: "high", value: "0x12" },
          { label: "low", value: "0x34" },
          { label: "BE", value: "[0x1000=0x12][0x1001=0x34]" },
          { label: "LE", value: "[0x1000=0x34][0x1001=0x12]" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [
          { address: "0x1000", value: "0x34", label: "<low>" },
          { address: "0x1001", value: "0x12", label: "<high>" },
        ],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "Little Endian: 低位バイトを低アドレスに置く。",
          "メモリは [low=0x34][high=0x12] の順。x86 や ARM はこちら。",
        ],
      },
    },
    // Step 4 — 実務での使い分け
    {
      target: { title: "16-bit value", lines: TARGET_LINES },
      representation: {
        items: [
          { label: "value", value: "0x1234" },
          { label: "CPU (x86/ARM)", value: "LE" },
          { label: "network (TCP/IP, HTTP/2)", value: "BE" },
          { label: "memory (this machine)", value: "[0x34][0x12]" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [
          { address: "0x1000", value: "0x34", label: "<low>" },
          { address: "0x1001", value: "0x12", label: "<high>" },
        ],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "x86/ARM の CPU は LE。",
          "一方 TCP/IP や HTTP/2 のバイナリフィールドは BE (network byte order)。",
          "通信時は htons() 等で変換するのが約束事。",
        ],
      },
    },
    // Step 5 — Quiz
    {
      target: { title: "16-bit value", lines: TARGET_LINES },
      representation: {
        items: [
          { label: "value", value: "0x1234" },
          { label: "LE layout", value: "[low=0x34][high=0x12]" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [
          { address: "0x1000", value: "0x34", label: "<low>" },
          { address: "0x1001", value: "0x12", label: "<high>" },
        ],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "LE = 低位バイトが低アドレス。",
          "1 バイト (L0, L1) なら関係ないが、2 バイト以上で効いてくる。",
        ],
        quiz: {
          question: "x86 系 CPU のメモリ上のバイト順は?",
          choices: [
            { id: "a", text: "Big Endian (高位バイトが低アドレス)" },
            { id: "b", text: "Little Endian (低位バイトが低アドレス)" },
            { id: "c", text: "設定で切替" },
          ],
          correctId: "b",
        },
      },
    },
  ],
};

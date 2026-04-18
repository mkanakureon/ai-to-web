// 仕様出典: docs/reports/2026/04/18/05-l1-through-l10-curriculum-spec.md — L8
// Target: 同じ 4 バイトでも「何として読むか」で意味が変わる
// 型 = バイト列の読み方の指定
import type { Lesson, MemoryCell } from "../types.js";

function bytesPlain(): MemoryCell[] {
  return [
    { address: "0x1000", value: "0x48" },
    { address: "0x1001", value: "0x54" },
    { address: "0x1002", value: "0x54" },
    { address: "0x1003", value: "0x50" },
  ];
}

function bytesAsChars(): MemoryCell[] {
  return [
    { address: "0x1000", value: "0x48", label: "<'H'>" },
    { address: "0x1001", value: "0x54", label: "<'T'>" },
    { address: "0x1002", value: "0x54", label: "<'T'>" },
    { address: "0x1003", value: "0x50", label: "<'P'>" },
  ];
}

export const l8: Lesson = {
  id: "L8",
  title: "文字列 vs バイト列",
  steps: [
    // Step 1 — バイトを見る (解釈なし)
    {
      target: {
        title: "4 bytes at 0x1000",
        lines: ["bytes: 0x48 0x54 0x54 0x50"],
      },
      representation: {
        items: [{ label: "bytes", value: "0x48 0x54 0x54 0x50" }],
      },
      cpuBusMemory: {
        memoryCells: bytesPlain(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "メモリの 4 バイトを見ています。",
          "これが「何を意味するか」は、どう読むかで変わります。",
        ],
      },
    },
    // Step 2 — 文字列として読む
    {
      target: {
        title: "4 bytes at 0x1000",
        lines: ["bytes: 0x48 0x54 0x54 0x50", "read as: char[]"],
      },
      representation: {
        items: [
          { label: "bytes", value: "0x48 0x54 0x54 0x50" },
          { label: "as chars", value: "'H' 'T' 'T' 'P'" },
          { label: "as string", value: "\"HTTP\"" },
        ],
      },
      cpuBusMemory: {
        memoryCells: bytesAsChars(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "文字列として読むと、各バイトを ASCII に対応させる。",
          "0x48='H', 0x54='T', 0x54='T', 0x50='P' → \"HTTP\"",
        ],
      },
    },
    // Step 3 — uint32_t Big Endian として読む
    {
      target: {
        title: "4 bytes at 0x1000",
        lines: ["bytes: 0x48 0x54 0x54 0x50", "read as: uint32_t (BE)"],
      },
      representation: {
        items: [
          { label: "bytes", value: "0x48 0x54 0x54 0x50" },
          { label: "as uint32 BE", value: "0x48545450" },
          { label: "decimal", value: "1,213,486,160" },
        ],
      },
      cpuBusMemory: {
        memoryCells: bytesAsChars(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "Big Endian で uint32_t として読むと、最初のバイトが最上位。",
          "0x48, 0x54, 0x54, 0x50 → 0x48545450 = 1,213,486,160。",
        ],
      },
    },
    // Step 4 — uint32_t Little Endian として読む
    {
      target: {
        title: "4 bytes at 0x1000",
        lines: ["bytes: 0x48 0x54 0x54 0x50", "read as: uint32_t (LE)"],
      },
      representation: {
        items: [
          { label: "bytes", value: "0x48 0x54 0x54 0x50" },
          { label: "as uint32 BE", value: "0x48545450 (1.2B)" },
          { label: "as uint32 LE", value: "0x50545448 (1.3B)" },
          { label: "as string", value: "\"HTTP\"" },
        ],
      },
      cpuBusMemory: {
        memoryCells: bytesAsChars(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "Little Endian なら最初のバイトが最下位。",
          "0x48, 0x54, 0x54, 0x50 → 0x50545448 = 1,347,703,880。",
          "同じバイト列が、型の解釈次第で 3 通りの意味になる。",
        ],
      },
    },
    // Step 5 — Quiz
    {
      target: {
        title: "4 bytes at 0x1000",
        lines: ["bytes: 0x48 0x54 0x54 0x50"],
      },
      representation: {
        items: [
          { label: "同じバイト列", value: "0x48 0x54 0x54 0x50" },
          { label: "as string", value: "\"HTTP\"" },
          { label: "as uint32 BE", value: "0x48545450" },
          { label: "as uint32 LE", value: "0x50545448" },
        ],
      },
      cpuBusMemory: {
        memoryCells: bytesAsChars(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "型 = バイト列の読み方の指定。データ自体は同じでも意味が変わる。",
          "次の L9 では、この考え方で HTTP リクエストを見ます。",
        ],
        quiz: {
          question: "メモリに `0x48 0x54 0x54 0x50` と並ぶ 4 バイトを文字列として読むと?",
          choices: [
            { id: "a", text: "\"HTTP\"" },
            { id: "b", text: "\"HTPP\"" },
            { id: "c", text: "\"PTTH\"" },
          ],
          correctId: "a",
        },
      },
    },
  ],
};

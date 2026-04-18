// 仕様出典: docs/reports/2026/04/18/05-l1-through-l10-curriculum-spec.md — L1
// Target: uint8_t/uint16_t/uint32_t が占めるバイト数を観察する
import type { Lesson } from "../types.js";

const DEFAULT_KEY_HINTS = ["[n]next", "[p]prev", "[q]quit"];

// a (uint8_t = 65 = 0x41)           : 0x1000
// b (uint16_t = 256 = 0x0100, LE)    : 0x1001..0x1002
// c (uint32_t = 65536 = 0x00010000)  : 0x1003..0x1006
const MEM_A = { address: "0x1000", value: "0x41", label: "<a>" } as const;
const MEM_B_LO = { address: "0x1001", value: "0x00", label: "<b[lo]>" } as const;
const MEM_B_HI = { address: "0x1002", value: "0x01", label: "<b[hi]>" } as const;
const MEM_C_0 = { address: "0x1003", value: "0x00", label: "<c[0]>" } as const;
const MEM_C_1 = { address: "0x1004", value: "0x00", label: "<c[1]>" } as const;
const MEM_C_2 = { address: "0x1005", value: "0x01", label: "<c[2]>" } as const;
const MEM_C_3 = { address: "0x1006", value: "0x00", label: "<c[3]>" } as const;

const TARGET_S1 = ["uint8_t a = 65;"];
const TARGET_S2 = ["uint8_t  a = 65;", "uint16_t b = 256;"];
const TARGET_S3 = ["uint8_t  a = 65;", "uint16_t b = 256;", "uint32_t c = 65536;"];

export const l1: Lesson = {
  id: "L1",
  title: "整数の基本",
  steps: [
    // Step 1 — uint8_t a (1 byte)
    {
      target: { title: "Integer types", lines: TARGET_S1 },
      representation: {
        items: [{ label: "a", value: "65 (1 byte)" }],
      },
      cpuBusMemory: {
        memoryCells: [{ ...MEM_A }],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "uint8_t は 8ビット = 1バイト。",
          "1バイトで表せる値は 2^8 = 256 通り (0〜255)。",
        ],
        keyHints: DEFAULT_KEY_HINTS,
      },
    },
    // Step 2 — add uint16_t b (2 bytes)
    {
      target: { title: "Integer types", lines: TARGET_S2 },
      representation: {
        items: [
          { label: "a", value: "65 (1 byte)" },
          { label: "b", value: "256 (2 bytes)" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [{ ...MEM_A }, { ...MEM_B_LO }, { ...MEM_B_HI }],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "uint16_t は 16ビット = 2バイト。",
          "256 = 0x0100 が 2 セルに分かれてメモリに並ぶ。",
          "(バイト順の話は L2 エンディアンで詳しく)",
        ],
        keyHints: DEFAULT_KEY_HINTS,
      },
    },
    // Step 3 — add uint32_t c (4 bytes)
    {
      target: { title: "Integer types", lines: TARGET_S3 },
      representation: {
        items: [
          { label: "a", value: "65 (1 byte)" },
          { label: "b", value: "256 (2 bytes)" },
          { label: "c", value: "65536 (4 bytes)" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [
          { ...MEM_A },
          { ...MEM_B_LO }, { ...MEM_B_HI },
          { ...MEM_C_0 }, { ...MEM_C_1 }, { ...MEM_C_2 }, { ...MEM_C_3 },
        ],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "uint32_t は 32ビット = 4バイト。",
          "3 種類の型が並ぶと、1 / 2 / 4 と占める幅が違う。",
        ],
        keyHints: DEFAULT_KEY_HINTS,
      },
    },
    // Step 4 — show value ranges
    {
      target: { title: "Integer types", lines: TARGET_S3 },
      representation: {
        items: [
          { label: "a range", value: "0 〜 255 (2^8)" },
          { label: "b range", value: "0 〜 65535 (2^16)" },
          { label: "c range", value: "0 〜 4294967295 (2^32)" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [
          { ...MEM_A },
          { ...MEM_B_LO }, { ...MEM_B_HI },
          { ...MEM_C_0 }, { ...MEM_C_1 }, { ...MEM_C_2 }, { ...MEM_C_3 },
        ],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "何バイトあるか = 何通り表現できるか。",
          "n バイトなら 2^(8n) 通り。型選びは値の範囲とメモリのトレードオフ。",
        ],
        keyHints: DEFAULT_KEY_HINTS,
      },
    },
    // Step 5 — Quiz
    {
      target: { title: "Integer types", lines: TARGET_S3 },
      representation: {
        items: [
          { label: "a", value: "1 byte" },
          { label: "b", value: "2 bytes" },
          { label: "c", value: "4 bytes" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [
          { ...MEM_A },
          { ...MEM_B_LO }, { ...MEM_B_HI },
          { ...MEM_C_0 }, { ...MEM_C_1 }, { ...MEM_C_2 }, { ...MEM_C_3 },
        ],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "型の幅 = メモリに占めるバイト数。",
          "uint8/16/32 の数字は「そのままビット数」。",
        ],
        keyHints: [...DEFAULT_KEY_HINTS, "[a/b/c]answer"],
        quiz: {
          question: "uint16_t 型の変数はメモリを何バイト使いますか?",
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

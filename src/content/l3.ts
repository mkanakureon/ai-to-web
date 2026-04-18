// 仕様出典: docs/reports/2026/04/18/05-l1-through-l10-curriculum-spec.md — L3
// Target: C の文字列 "Hi" が「char 配列 + NULL 終端」として 3 バイトをメモリに占めることを観察
import type { Lesson } from "../types.js";

const TARGET_LINES = ["char s[] = \"Hi\";"];

export const l3: Lesson = {
  id: "L3",
  title: "char と文字列",
  steps: [
    // Step 1 — ソースを見る
    {
      target: { title: "C string", lines: TARGET_LINES },
      representation: {
        items: [{ label: "literal", value: "\"Hi\"" }],
      },
      cpuBusMemory: {
        memoryCells: [
          { address: "0x1000", value: "??", label: "<s[0]>" },
          { address: "0x1001", value: "??", label: "<s[1]>" },
        ],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "char s[] = \"Hi\"; を観察します。",
          "文字列リテラル \"Hi\" がメモリのどこに、何バイト並ぶ?",
        ],
      },
    },
    // Step 2 — 各文字の ASCII コード
    {
      target: { title: "C string", lines: TARGET_LINES },
      representation: {
        items: [
          { label: "literal", value: "\"Hi\"" },
          { label: "'H'", value: "72  = 0x48" },
          { label: "'i'", value: "105 = 0x69" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [
          { address: "0x1000", value: "??", label: "<s[0]>" },
          { address: "0x1001", value: "??", label: "<s[1]>" },
        ],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "各文字は ASCII コードに対応する 1 バイト。",
          "'H' = 72 = 0x48, 'i' = 105 = 0x69。",
        ],
      },
    },
    // Step 3 — 2 セルに文字を入れる
    {
      target: { title: "C string", lines: TARGET_LINES },
      representation: {
        items: [
          { label: "literal", value: "\"Hi\"" },
          { label: "'H'", value: "0x48" },
          { label: "'i'", value: "0x69" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [
          { address: "0x1000", value: "0x48", label: "<'H'>" },
          { address: "0x1001", value: "0x69", label: "<'i'>" },
        ],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "2 文字がメモリの 2 セルに並びました。",
          "— でも、ここで 1 つ問題。文字列はどこで終わると判断する?",
        ],
      },
    },
    // Step 4 — NULL 終端を足す
    {
      target: { title: "C string", lines: TARGET_LINES },
      representation: {
        items: [
          { label: "literal", value: "\"Hi\"" },
          { label: "'H'", value: "0x48" },
          { label: "'i'", value: "0x69" },
          { label: "'\\0'", value: "0x00 (terminator)" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [
          { address: "0x1000", value: "0x48", label: "<'H'>" },
          { address: "0x1001", value: "0x69", label: "<'i'>" },
          { address: "0x1002", value: "0x00", label: "<'\\0'>" },
        ],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "C では文字列の末尾に \\0 (NULL 文字 = 0x00) を置くお約束。",
          "これが「ここで終わり」の目印。3 セル目に 0x00 が追加されます。",
        ],
      },
    },
    // Step 5 — Quiz
    {
      target: { title: "C string", lines: TARGET_LINES },
      representation: {
        items: [
          { label: "string", value: "\"Hi\"" },
          { label: "length", value: "2 chars" },
          { label: "bytes", value: "3 bytes (incl. \\0)" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [
          { address: "0x1000", value: "0x48", label: "<'H'>" },
          { address: "0x1001", value: "0x69", label: "<'i'>" },
          { address: "0x1002", value: "0x00", label: "<'\\0'>" },
        ],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "\"Hi\" は 2 文字だが、メモリは 3 バイト占める。",
          "C の文字列のバイト数 = 文字数 + 1 (NULL 終端)。",
        ],
        quiz: {
          question: "char s[] = \"Hi\"; のとき、s はメモリを何バイト使いますか?",
          choices: [
            { id: "a", text: "2" },
            { id: "b", text: "3" },
            { id: "c", text: "4" },
          ],
          correctId: "b",
        },
      },
    },
  ],
};

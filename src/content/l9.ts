// 仕様出典: docs/reports/2026/04/18/05-l1-through-l10-curriculum-spec.md — L9
// Target: HTTP リクエストはテキストに見えるバイト列プロトコル
// メッセージ全体 (18 バイト) をメモリに並べて観察する
import type { Lesson, MemoryCell } from "../types.js";

// HTTP message: `GET / HTTP/1.1\r\n\r\n`  (18 bytes)
// 0x1000: "GET / HT" (8 bytes)
// 0x1008: "TP/1.1\r\n" (8 bytes)
// 0x1010: "\r\n"       (2 bytes)

const ROW_1 = { address: "0x1000", value: "0x47 0x45 0x54 0x20 0x2F 0x20 0x48 0x54", label: "<\"GET / HT\">" };
const ROW_2 = { address: "0x1008", value: "0x54 0x50 0x2F 0x31 0x2E 0x31 0x0D 0x0A", label: "<\"TP/1.1\\r\\n\">" };
const ROW_3 = { address: "0x1010", value: "0x0D 0x0A",                               label: "<\"\\r\\n\">" };

function plainMemory(): MemoryCell[] {
  return [{ ...ROW_1 }, { ...ROW_2 }, { ...ROW_3 }];
}

function crlfHighlightedMemory(): MemoryCell[] {
  return [
    { ...ROW_1 },
    { ...ROW_2, selected: true },
    { ...ROW_3, selected: true },
  ];
}

const TARGET_LINES = [
  "GET / HTTP/1.1\\r\\n",
  "\\r\\n",
];

export const l9: Lesson = {
  id: "L9",
  title: "HTTP の正体",
  steps: [
    // Step 1 — HTTP リクエストを見せる
    {
      target: {
        title: "HTTP request",
        lines: TARGET_LINES,
      },
      representation: {
        items: [
          { label: "message", value: "GET / HTTP/1.1 + CRLF x2" },
          { label: "bytes", value: "18 bytes" },
        ],
      },
      cpuBusMemory: {
        memoryCells: plainMemory(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "典型的な HTTP リクエスト。人間にはテキストに見える。",
          "でもメモリ上では ASCII バイトが並ぶだけの「バイト列」。",
        ],
      },
    },
    // Step 2 — \r\n の正体
    {
      target: {
        title: "HTTP request",
        lines: TARGET_LINES,
      },
      representation: {
        items: [
          { label: "\\r (CR)", value: "0x0D" },
          { label: "\\n (LF)", value: "0x0A" },
          { label: "\\r\\n", value: "2 bytes" },
          { label: "HTTP の行末", value: "\\r\\n (CRLF)" },
        ],
      },
      cpuBusMemory: {
        memoryCells: crlfHighlightedMemory(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "行末の \\r\\n (CRLF) は 2 バイトの制御文字。",
          "\\r = 0x0D (キャリッジリターン), \\n = 0x0A (ラインフィード)。",
          "Row 2 の末尾と Row 3 全体が \\r\\n。",
        ],
      },
    },
    // Step 3 — hex ダンプ全体
    {
      target: {
        title: "HTTP request",
        lines: TARGET_LINES,
      },
      representation: {
        items: [
          { label: "offset", value: "hex bytes                              ASCII" },
          { label: "0x1000", value: "47 45 54 20 2F 20 48 54   GET / HT" },
          { label: "0x1008", value: "54 50 2F 31 2E 31 0D 0A   TP/1.1\\r\\n" },
          { label: "0x1010", value: "0D 0A                     \\r\\n" },
        ],
      },
      cpuBusMemory: {
        memoryCells: plainMemory(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "全体を hex dump すると、文字列とバイト列が 1:1 で対応していることがわかる。",
          "各バイトが ASCII 表の 1 文字、または \\r\\n の制御。",
        ],
      },
    },
    // Step 4 — ネットワークへの送信
    {
      target: {
        title: "HTTP request",
        lines: [...TARGET_LINES, "→ TCP/IP → NIC"],
      },
      representation: {
        items: [
          { label: "送信するもの", value: "これら 18 バイト" },
          { label: "TCP/IP パケット", value: "ヘッダ + payload (このバイト列)" },
          { label: "受信側", value: "同じ 18 バイトを受け取り、同じ解釈" },
          { label: "レスポンス", value: "HTTP/1.1 200 OK\\r\\n... (同じ形式)" },
        ],
      },
      cpuBusMemory: {
        memoryCells: plainMemory(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "OS はこのメモリ上のバイト列をそのまま TCP/IP に載せて NIC へ流す。",
          "サーバーは同じ 18 バイトを受け取り、文字列として解釈する。",
          "HTTP のレスポンスも同じ ASCII バイト列形式。",
        ],
      },
    },
    // Step 5 — Quiz
    {
      target: {
        title: "HTTP request",
        lines: TARGET_LINES,
      },
      representation: {
        items: [
          { label: "HTTP", value: "テキストに見えるバイト列" },
          { label: "\\r", value: "0x0D (1 byte)" },
          { label: "\\n", value: "0x0A (1 byte)" },
          { label: "\\r\\n", value: "?" },
        ],
      },
      cpuBusMemory: {
        memoryCells: plainMemory(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "HTTP はテキストに見えるが、メモリ上もネットワーク上もバイト列。",
          "L8 の「バイト列の解釈」が、ここでプロトコルの正体に繋がる。",
        ],
        quiz: {
          question: "HTTP メッセージの改行 \"\\r\\n\" は何バイトですか?",
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

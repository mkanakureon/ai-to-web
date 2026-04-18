// 仕様出典: docs/reports/2026/04/18/05-l1-through-l10-curriculum-spec.md — L10
// Target: TS の fetch() が最終的にバイト列としてメモリ/NIC を行き来する階層を統合
// L0-L9 で学んだことを一本の階層図で繋ぐ
import type { Lesson, MemoryCell } from "../types.js";

// L9 の HTTP リクエストと同じバイト列を使用
const HTTP_MEM = (): MemoryCell[] => [
  { address: "0x1000", value: "0x47 0x45 0x54 0x20 0x2F 0x20 0x48 0x54", label: "<\"GET / HT\">" },
  { address: "0x1008", value: "0x54 0x50 0x2F 0x31 0x2E 0x31 0x0D 0x0A", label: "<\"TP/1.1\\r\\n\">" },
  { address: "0x1010", value: "0x0D 0x0A",                               label: "<\"\\r\\n\">" },
];

const HTTP_MEM_ALL_SELECTED = (): MemoryCell[] =>
  HTTP_MEM().map((c) => ({ ...c, selected: true }));

const LAYER_TS = [
  "TypeScript:",
  "  const res = await fetch(\"http://example.com/\");",
];
const LAYER_NODE = [
  "  |",
  "  v",
  "Node http module:",
  "  build HTTP message → GET / HTTP/1.1\\r\\n\\r\\n",
];
const LAYER_OS = [
  "  |",
  "  v",
  "OS socket layer:",
  "  TCP/IP packet = header + payload(18 bytes)",
];
const LAYER_NIC = [
  "  |",
  "  v",
  "NIC (hardware):",
  "  DMA reads memory → electrical signals on wire",
];

export const l10: Lesson = {
  id: "L10",
  title: "C → HTTP → TS 全統合",
  intro: {
    objective: "TS の fetch() が Node → OS → NIC と 4 層降りて物理信号になるまでを、L0-L9 の学びを総動員して追う。",
    overview: [
      "たった 1 行の fetch() の裏では、Node ランタイムが L9 で見た HTTP バイトを組み立て、OS が TCP/IP で梱包し、NIC が DMA でメモリから読み取って電気信号として送り出す、という 4 層のスタックが降りていく。",
      "同じ 18 バイトが層を降りるだけで、情報の中身は変わらない。",
      "これで L0-L10 のカリキュラムは総仕上げ。",
    ],
    terms: [
      { term: "ランタイム (Node)", description: "言語の実行系。fetch() を低レベル API に翻訳する。" },
      { term: "ソケット (socket)", description: "OS が提供するネットワーク通信の入り口。read/write 形式の API。" },
      { term: "DMA (Direct Memory Access)", description: "CPU を経由せず、NIC が直接メモリからバイトを取り出す仕組み。" },
      { term: "ネットワークスタック", description: "TS → Node → OS → NIC の層構造。各層が自分の仕事をして次に渡す。" },
    ],
    firstStepHint: "このあと: 1 行の fetch() から始めて、層が 1 つずつ積み上がり、最後に DMA でメモリからバイトが流れ出る様子を見ます。",
  },
  steps: [
    // Step 1 — TS の 1 行を見る
    {
      target: { title: "Layers", lines: LAYER_TS },
      representation: {
        items: [
          { label: "layer", value: "TypeScript (application)" },
          { label: "code", value: "1 行の fetch()" },
          { label: "問い", value: "この 1 行で裏で何が動いている?" },
        ],
      },
      cpuBusMemory: {
        memoryCells: [],
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "TypeScript の fetch() は 1 行でネットワーク通信できる。",
          "L0〜L9 で見てきた「メモリ・バイト・HTTP」の話が、この 1 行の裏で全部起きている。",
          "ここから下へ降りていく。",
        ],
      },
    },
    // Step 2 — Node ランタイムが HTTP メッセージを構築
    {
      target: { title: "Layers", lines: [...LAYER_TS, ...LAYER_NODE], highlightLine: 4 },
      representation: {
        items: [
          { label: "1. TypeScript", value: "fetch(\"http://...\")" },
          { label: "2. Node http", value: "HTTP message を構築" },
          { label: "書き込み先", value: "メモリ 0x1000..0x1011 (18 bytes)" },
        ],
      },
      cpuBusMemory: {
        memoryCells: HTTP_MEM(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "Node ランタイムは引数を元に HTTP リクエストのバイト列を組み立て、",
          "メモリに書き込む。中身は L9 で見た 18 バイトそのもの。",
        ],
      },
    },
    // Step 3 — OS がソケット経由で TCP/IP パケットに梱包
    {
      target: {
        title: "Layers",
        lines: [...LAYER_TS, ...LAYER_NODE, ...LAYER_OS],
        highlightLine: 8,
      },
      representation: {
        items: [
          { label: "1. TypeScript", value: "fetch(...)" },
          { label: "2. Node http", value: "18 bytes @ 0x1000" },
          { label: "3. OS socket", value: "TCP/IP packet = header + payload" },
          { label: "payload", value: "そのまま 18 bytes の HTTP" },
        ],
      },
      cpuBusMemory: {
        memoryCells: HTTP_MEM(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "OS はこのメモリ上のバイト列を TCP/IP パケットで梱包する。",
          "宛先 IP・ポートなどのヘッダを追加するが、payload はメモリ上のバイト列そのまま。",
          "HTTP は中身を変えられない (OS から見れば意味不明なバイト列)。",
        ],
      },
    },
    // Step 4 — NIC が DMA でメモリから読み物理信号へ
    {
      target: {
        title: "Layers",
        lines: [...LAYER_TS, ...LAYER_NODE, ...LAYER_OS, ...LAYER_NIC],
        highlightLine: 12,
      },
      representation: {
        items: [
          { label: "1. TypeScript", value: "fetch(...)" },
          { label: "2. Node http", value: "build bytes" },
          { label: "3. OS socket", value: "TCP/IP packet" },
          { label: "4. NIC", value: "DMA read + 電気信号" },
          { label: "物理層", value: "電圧のパルスとして送信" },
        ],
      },
      cpuBusMemory: {
        mar: "0x1000..0x1011",
        addressBusValue: "sweeping 0x1000..",
        dataBusValue: "bytes streaming out",
        memoryCells: HTTP_MEM_ALL_SELECTED(),
        phase: "done",
      },
      explainQuiz: {
        explanationLines: [
          "NIC は DMA (Direct Memory Access) でメモリから直接バイト列を読み、",
          "それを電気信号 (または光) に変換してケーブルへ送る。",
          "ここまで来て初めて、バイト列が物理世界へ出る。",
        ],
      },
    },
    // Step 5 — Quiz + カリキュラム完了
    {
      target: {
        title: "Layers (summary)",
        lines: [
          "TS fetch()",
          "  → Node が HTTP bytes を組み立て",
          "  → OS が TCP/IP で梱包",
          "  → NIC が DMA で読み物理信号へ",
          "",
          "同じ 18 バイトが 4 層を降りて世界へ出る",
        ],
      },
      representation: {
        items: [
          { label: "共通の実体", value: "18 bytes (HTTP message)" },
          { label: "各層の仕事", value: "作る / 梱包 / 物理化" },
          { label: "L0-L9 の総動員", value: "bytes・alignment・CRLF・endian・型解釈" },
        ],
      },
      cpuBusMemory: {
        memoryCells: HTTP_MEM(),
        phase: "idle",
      },
      explainQuiz: {
        explanationLines: [
          "1 行の fetch() = 4 層のスタックを降りて物理信号に化けるバイト列の旅。",
          "レスポンスも逆ルートで戻り、最終的に TS のオブジェクトになる。",
          "これで L0-L10 完了。ブラウザ側 (DOM) とサーバー側 (API) は、このバイト列の扱い方の話。",
        ],
        quiz: {
          question: "TypeScript の fetch(\"/api\") が最終的に物理的にやっていることに最も近いのは?",
          choices: [
            { id: "a", text: "TS エンジンが直接文字列を返す" },
            { id: "b", text: "OS を経由して HTTP バイト列を TCP/IP で送受信する" },
            { id: "c", text: "C 関数の単純なコピー" },
          ],
          correctId: "b",
        },
      },
    },
  ],
};

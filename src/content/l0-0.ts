// L0-0: 学習ツール ai-to-web の概要
// 観察ステップなし (steps: []) の「文書のみ」レッスン
import type { Lesson } from "../types.js";

export const l0_0: Lesson = {
  id: "L0-0",
  title: "このツールについて",
  intro: {
    objective: "学習ツール ai-to-web の目的と、L0-1 から L10 までのカリキュラム全体を知る。",
    overview: [
      "最終目的: あなたが AI と会話しながら「ブラウザ + サーバー + TypeScript + DB」構成のアプリを自力で作れるようになること。",
      "そのためには、TS の 1 行の fetch() が内部で何をしているかを、バイト・アドレス・CPU のレベルまで降りて説明できる必要がある。このツールはその「下まで降りる視点」を身につけるための観察装置。",
      "抽象的な説明ではなく、同じ 4 ペイン骨格 (Target / Representation / CpuBusMemory / ExplainQuiz) で何度も同じメンタルモデルを見ることで、階層を 1 本の線で繋いでいく。",
      "カリキュラム: L0-1〜L0-3 で読み取りサイクルの基礎、L1〜L7 で C の型とメモリ、L8〜L9 でバイト列と HTTP、L10 で fetch() の全層統合。",
    ],
    terms: [
      { term: "メンタルモデル", description: "「CPU が番地を指定してメモリからバイトを読む」という 1 つの見方。全レッスンで繰り返し使う。" },
      { term: "4ペイン", description: "Target (観察対象) / Representation (別表現) / CpuBusMemory (読み取り動作) / ExplainQuiz (解説と問い) の固定レイアウト。" },
      { term: "C は観察対象", description: "このツールでは C を「書けるようになる」ためではなく、「バイトとアドレスを可視化するレンズ」として使う。" },
      { term: "読み物 → 観察", description: "各レッスンはまず概念と用語を短く読み、そのあと 4 ペインで状態遷移を観察する 2 段構成。" },
    ],
    firstStepHint: "メニューに戻って L0-1 から始めましょう。いつでもここに戻ってこのツールの全体像を読み返せます。",
  },
  steps: [], // 観察ステップなし — intro のみで完結
};

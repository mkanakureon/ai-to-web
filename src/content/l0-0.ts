// L0-0: 学習ツール ai-to-web の概要
// 観察ステップなし (steps: []) の「文書のみ」レッスン
import type { Lesson } from "../types.js";

export const l0_0: Lesson = {
  id: "L0-0",
  title: "このツールについて",
  intro: {
    objective: "学習ツール ai-to-web の目的と、L0-1 から L10 までのカリキュラム全体を知る。",
    overview: [
      "最終目的: あなたが AI と会話しながら「ブラウザ + サーバー + TypeScript + DB」のアプリを自力で作れるようになること。",
      "そのために、TS の 1 行の fetch() をバイト・アドレス・CPU まで降りて説明できる「下まで降りる視点」を身につける。",
      "カリキュラム: L0-1〜L0-3 読み取りサイクル / L1〜L7 C の型とメモリ / L8〜L9 バイト列と HTTP / L10 fetch() の全層統合。",
    ],
    terms: [
      { term: "メンタルモデル", description: "「CPU が番地を指定してメモリからバイトを読む」を全レッスンで繰り返し使う視点。" },
      { term: "4ペイン", description: "Target / Representation / CpuBusMemory / ExplainQuiz の固定レイアウト。全レッスン共通。" },
      { term: "C は観察対象", description: "C を「書く」ためではなく、バイトとアドレスを可視化するレンズとして使う。" },
    ],
    firstStepHint: "メニューに戻って L0-1 から始めましょう。",
  },
  steps: [], // 観察ステップなし — intro のみで完結
};

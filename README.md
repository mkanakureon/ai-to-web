# ai-to-web

> AI と会話しながら「ブラウザ + サーバー + TypeScript + DB」構成のアプリを自力で作れるようになることを目指す学習ツール。

最下層 (バイト・メモリ・CPU・バス) から最上層 (TS の `fetch()`) までのデータの流れを、4 ペインの TUI で段階的に観察する教材です。

**オンライン版:** https://mkanakureon.github.io/ai-to-web/ (何もインストール不要)

---

## これは何か

現代のアプリ開発は TypeScript の 1 行で動くように見える。でもその裏では、バイトがメモリに並び、CPU が番地を指定して読み、HTTP のバイト列に組み立てられ、NIC から電気信号として流れていく。

このツールは、その「下まで降りる視点」を身につけるための観察装置。抽象的な説明ではなく、同じ 4 ペイン骨格 — **Target / Representation / CpuBusMemory / ExplainQuiz** — で同じメンタルモデルを何度も見ることで、階層を 1 本の線で繋ぐ。

---

## 今回の範囲: データの流れを「見る」

v1 では最下層 → fetch() までの**データの往路**を段階的に観察できる **14 レッスン**を実装:

| ID | タイトル | 学ぶこと |
|----|---------|---------|
| L0-0 | このツールについて | 全体の概要 (文書のみ) |
| L0-1 | 2進数とビット | 1 バイトの複数表現 |
| L0-2 | CPU / メモリ / バス | 読み取り 1 サイクル |
| L0-3 | メモリアクセスと C の接続 | C のソースとメモリの関係 |
| L1 | 整数の基本 | uint8 / uint16 / uint32 のバイト幅 |
| L2 | エンディアン | Little / Big Endian |
| L3 | char と文字列 | NULL 終端 |
| L4 | 配列とポインタ | address arithmetic |
| L5 | ポインタの正体 | アドレスを保持する変数 |
| L6 | struct とメモリ配置 | フィールドの連続配置 |
| L7 | パディング (alignment) | 見えないバイト |
| L8 | 文字列 vs バイト列 | 型 = 解釈の指定 |
| L9 | HTTP の正体 | ASCII バイト列としての HTTP |
| L10 | C → HTTP → TS 全統合 | fetch() の 4 層スタック |

各レッスンは **読み物 (概念・用語) → 観察 (4 ペインで状態遷移) → クイズ** の 2 段構成。

---

## 今後の予定: 上のレイヤー

v1 で「バイトがメモリから NIC まで流れ出る」までを見たあと、ここから本番:

- **サーバー**: Hono / Express などで API を書く、リクエストとレスポンスの扱い方
- **TypeScript アプリ実装**: ブラウザ側の状態管理、画面構築、エラーハンドリング
- **DB**: SQLite / PostgreSQL との読み書き、スキーマ設計

最終ゴールは「AI と会話しながら、自分でブラウザ ↔ サーバー ↔ DB のデータ往復を設計・実装できる」ようになること。

---

## 使い方

### オンライン (推奨)

https://mkanakureon.github.io/ai-to-web/ を開く。

### ローカル実行

Node.js 20 以上が必要。

```bash
git clone https://github.com/mkanakureon/ai-to-web.git
cd ai-to-web
npm install

# Web 版 (xterm.js で起動)
npm run dev:web          # http://localhost:5173

# CLI 版 (ターミナル直接)
npm run dev              # タイトル画面から
npm run dev -- L0-1      # 特定レッスンに直接入る
npm run dev -- --list    # レッスン ID の一覧
```

---

## 操作キー

| キー | 動作 |
|-----|------|
| `Enter` / `n` | 次のステップへ / 観察を始める |
| `p` | 前のステップへ |
| `↑` / `↓` (または `j` / `k`) | メニューでレッスン選択 |
| `m` / `q` | メニューへ戻る |
| `t` | タイトル画面へ戻る |
| `r` | レッスンの最初へリセット |
| `a` / `b` / `c` | クイズ回答 |
| `Ctrl+C` | アプリ強制終了 |

---

## 設計思想

- **C は書く対象ではなく観察対象** — バイトとアドレスを可視化するレンズとして使う。実装言語は TypeScript。
- **4 ペイン固定レイアウト** — 全レッスン共通。同じ骨格を何度も見ることで、階層を繋ぐ視点を身につける。
- **読み物 → 観察の 2 段** — 各レッスンは概念・用語を読んでから、4 ペインで状態遷移を体感する。

---

## 開発

```bash
npm run typecheck      # tsc --noEmit
npm test               # reducer の状態遷移テスト
npm run snapshot       # ANSI 出力の仮想スクリーン再構成
npm run snapshot L1    # 特定レッスンを視覚化
npm run build:web      # dist-web/ に静的バンドル
```

GitHub Actions で `main` への push 時に自動で Pages デプロイされる (`.github/workflows/pages.yml`)。

### アーキテクチャ概要

```
src/
├── types.ts           # AppState の discriminated union (title / menu / intro / lesson)
├── reduce.ts          # 純粋関数の状態遷移
├── render.ts          # 4 ペイン + タイトル/メニュー/intro を ANSI 文字列で生成
├── keyboard.ts        # raw mode stdin / xterm.js onData → KeyEvent パーサ
├── ansi.ts            # ANSI エスケープ + 日本語幅判定 + wrap
├── app.ts             # input → reduce → render のメインループ
├── index.ts           # Node CLI エントリ
├── io/                # プラットフォーム抽象 (node / web)
├── web/main.ts        # ブラウザエントリ (xterm.js)
└── content/           # 各レッスンのデータ (l0-0.ts .. l10.ts)
```

---

## ログ

セッション履歴は `docs/claude_log/` にあります (個人情報は伏字化済み)。

---

> このプロジェクト自体が [Claude Code](https://claude.com/claude-code) との対話セッションで構築されました。

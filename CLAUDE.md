# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ai-to-web** は TypeScript + Node.js で書かれたローカル動作のコンソールアプリ。

- **実行環境:** 最初は macOS、次に WSL (Linux) で動作させる
- **依存しないもの:** DB、HTTPサーバー、ブラウザ、クラウド
- **動作形態:** 個人の PC 上で CLI として完結する

言語やI/Oの基本方針:
- 実装言語: TypeScript (実行は `tsx` または `node` + ビルド済みJS)
- Node.js のランタイム機能（`fs`, `path`, `readline`, `process`, `child_process`）のみを想定
- 外部サービス連携が必要な場合は、環境変数で API キーを渡して `fetch` で呼ぶ（Node 18+ 標準）

## Development Commands

プロジェクトのセットアップ・実行は以下のパターンを想定（`package.json` の `scripts` に合わせる）:

```bash
npm install           # 依存インストール
npm run typecheck     # tsc --noEmit
npm run lint          # oxlint or eslint
npm run build         # tsc
npm run dev           # tsx src/index.ts などで起動
npm test              # vitest / node:test
```

## Platform Portability (macOS → WSL Linux)

最初は macOS で動かし、その後 WSL の Linux へ持っていくことを前提にする。プラットフォーム依存で壊れやすい箇所:

| 項目 | 注意点 |
|------|--------|
| パス区切り | 直接 `/` を文字列結合せず、必ず `path.join` / `path.resolve` を使う |
| 改行コード | ファイルに書き込むときは `\n` に統一。CRLF を混ぜない |
| ホームディレクトリ | `os.homedir()` を使う。`~` 展開をシェルに任せない |
| 実行可能パス | `which` ではなく、環境変数 `PATH` と `child_process` で解決する |
| ファイル権限 | Linux では実行権限が効く。`chmod +x` が必要なスクリプトは README に明記 |
| 文字コード | 入出力は UTF-8 固定。`encoding: 'utf8'` を明示する |

macOS のみでしか動かない API（`osascript`, `pbcopy` 等）を使う場合は、Linux 側のフォールバック（`xclip` / `wl-copy` など）をコード内で分岐する。

## Rules

### バグ修正の手順（最重要）

**原因が特定できていない問題に対して、推測でソースコードを変更してはいけない。**

1. **再現条件を切り分ける** — 何があると起きて、何がないと起きないか
2. **原因を特定する** — ログ・実際の値で確認。推測しない
3. **修正方針を説明する** — 原因不明なら「不明」と伝える
4. **修正後に動作確認する** — 確認前に「修正完了」と報告しない

**禁止:** 推測でコード変更 / 未確認で「正常です」報告 / 推測変更の複数回繰り返し

### コミットは必ず commit スキル経由

`git commit` を直接実行しない。必ず `/commit` スキルを使う（`.claude/skills/commit/`）。
スキル経由でないと **Claude の一言** と **Co-Authored-By** が付かない。

### Before Creating New Files

- Glob/Grep で既存の類似ファイルを検索してから作成
- 既存に似た責務のモジュールがあれば寄せる

### New Abstraction Rules

新規 abstraction / helper / util は以下の**全て**を満たす場合のみ許可:

1. 同じ処理が **3箇所以上** にある
2. ドメイン概念として **名前がある**
3. 今後も **再利用が見込める**
4. 依存方向を **改善する**
5. テストしやすく **なる**

満たさなければ既存に寄せる。

### Testing

テストの目的は「エラーの発見」と「正常動作の確認」。

- `expect` は期待する状態を **1 つだけ** 明示する
- `if` で `expect` をスキップしない / フォールバック・エラー握りつぶし禁止
- 時間待ちでごまかさず、正しい条件を待つ
- 失敗 → 原因調査 → コード修正

### Forbidden Patterns

```typescript
// ── パス結合 ──
// NG: 文字列連結（Windows/WSLで壊れる）
const p = dir + "/" + name
// OK: path.join を使う
const p = path.join(dir, name)

// ── ホーム展開 ──
// NG: チルダのまま fs に渡す
fs.readFileSync("~/.config/foo")
// OK: os.homedir() で解決
fs.readFileSync(path.join(os.homedir(), ".config", "foo"))

// ── 外部コマンド ──
// NG: shell: true でユーザー入力を結合
exec(`grep ${userInput} file`)
// OK: 引数配列で渡す
execFile("grep", [userInput, "file"])
```

### 並列実行

- 独立したファイル・ディレクトリに閉じるタスクは並列で実行する
- 共有モジュールの同時編集は避ける

## Language

- 本文・仕様・コミットメッセージ: 日本語
- コード・識別子: 英語

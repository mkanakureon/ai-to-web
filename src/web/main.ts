// ブラウザ向けエントリポイント (xterm.js + Vite バンドル)
import { runApp } from "../app.js";
import { enterTitle } from "../reduce.js";
import { createWebIO } from "../io/web.js";

const container = document.getElementById("terminal");
if (!container) {
  throw new Error("Missing #terminal container");
}

const io = createWebIO(container);

// ブラウザでは常にタイトル画面から開始
await runApp(io, enterTitle());

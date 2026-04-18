// xterm.js を IO としてラップ
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import type { IO, IOSize } from "./types.js";

export function createWebIO(container: HTMLElement): IO {
  const term = new Terminal({
    fontFamily: "'SF Mono', Monaco, Menlo, Consolas, 'Courier New', monospace",
    fontSize: 14,
    cursorBlink: false,
    theme: {
      background: "#000000",
      foreground: "#d0d0d0",
    },
    allowProposedApi: true,
    scrollback: 0, // 4ペイン画面が勝手にスクロールしないように
  });
  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  term.open(container);
  fitAddon.fit();

  const resizeHandlers: Array<() => void> = [];
  const onWindowResize = (): void => {
    fitAddon.fit();
    for (const h of resizeHandlers) h();
  };
  window.addEventListener("resize", onWindowResize);

  return {
    getSize(): IOSize {
      return { cols: term.cols, rows: term.rows };
    },
    write(data: string): void {
      term.write(data);
    },
    onKey(handler: (data: string) => void): () => void {
      const sub = term.onData(handler);
      return () => sub.dispose();
    },
    onResize(handler: () => void): () => void {
      resizeHandlers.push(handler);
      const sub = term.onResize(() => handler());
      return () => {
        const i = resizeHandlers.indexOf(handler);
        if (i >= 0) resizeHandlers.splice(i, 1);
        sub.dispose();
      };
    },
    dispose(): void {
      window.removeEventListener("resize", onWindowResize);
      term.dispose();
    },
  };
}

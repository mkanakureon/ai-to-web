// 入出力抽象: Node TTY / xterm.js 両対応のための共通インターフェース
export type IOSize = { cols: number; rows: number };

export interface IO {
  getSize(): IOSize;
  write(data: string): void;
  onKey(handler: (data: string) => void): () => void;    // returns unsubscribe
  onResize(handler: () => void): () => void;             // returns unsubscribe
  dispose(): void;
}

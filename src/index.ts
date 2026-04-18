// Node.js エントリポイント
import { runApp, runHeadless, selectInitialState } from "./app.js";
import { createNodeIO } from "./io/node.js";
import { showCursor, RESET } from "./ansi.js";

// 異常終了時のカーソル復帰
process.on("exit", () => {
  process.stdout.write(showCursor() + RESET);
});

const initial = selectInitialState(process.argv);

if (!process.stdout.isTTY) {
  runHeadless(initial);
} else {
  const io = createNodeIO();
  try {
    await runApp(io, initial);
  } finally {
    io.dispose();
  }
}

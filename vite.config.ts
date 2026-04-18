import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  base: "./",  // file:// でも動くように相対パスで出力
  build: {
    outDir: "dist-web",
    emptyOutDir: true,
    target: "es2022",
    sourcemap: true,
  },
  server: {
    port: 5173,
    open: false,
  },
});

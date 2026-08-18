import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "cursor/canvas": "@thisismydesign/cursor-canvas-web",
    },
  },

  server: {
    host: "127.0.0.1",
  },
});

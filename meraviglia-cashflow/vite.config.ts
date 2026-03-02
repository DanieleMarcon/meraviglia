import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// 👉 Attiva solo se vuoi analizzare il bundle
import { visualizer } from "rollup-plugin-visualizer"

export default defineConfig({
  plugins: [
    react(),

    // 👉 Decommenta per analisi bundle
    
    visualizer({
      open: true,
      filename: "dist/stats.html",
      gzipSize: true,
    }),
    
  ],

  build: {
    chunkSizeWarningLimit: 800, // alziamo warning threshold per MVP

    rollupOptions: {
      output: {
        manualChunks: {
          // Separiamo librerie pesanti
          charts: ["recharts"],
        },
      },
    },
  },
})
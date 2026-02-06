import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "classic",
    }),
  ],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "build",
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          "material-ui": [
            "@material-ui/core",
            "@material-ui/icons",
            "@material-ui/lab",
          ],
          "charts": ["recharts"],
        },
      },
      external: [
        /^\.\.\/internals\/.*/,
      ],
    },
  },
  envPrefix: "VITE_",
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    include: [
      "mic-recorder-to-mp3",
      "lamejs",
      "@material-ui/core",
      "@material-ui/icons",
      "@material-ui/lab",
      "recharts",
    ],
    exclude: ["xlsx"],
  },
  resolve: {
    alias: {
      "jss-plugin-globalThis": "jss-plugin-global",
    },
  },
});


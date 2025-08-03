
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    historyApiFallback: true,
  },
  plugins: [
    react({
      // Updated SWC configuration to avoid deprecated options
      plugins: [],
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Updated build configuration to avoid deprecated options
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
  },
  // ESBuild configuration to avoid math-related deprecations
  esbuild: {
    logOverride: { 
      'this-is-undefined-in-esm': 'silent',
      'empty-import-meta': 'silent'
    },
    target: 'esnext',
  },
  // Suppress specific console warnings during development
  define: {
    __DEV__: mode === 'development',
  },
}));

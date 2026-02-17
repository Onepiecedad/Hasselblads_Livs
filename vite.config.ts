import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import compression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [react(), mode === "development" && componentTagger()].filter(Boolean);

  if (mode === "production") {
    plugins.push(
      compression({
        algorithm: "brotliCompress",
        ext: ".br",
      }),
      compression({
        algorithm: "gzip",
        ext: ".gz",
      }),
    );
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      globals: true,
      environment: "node",
      include: ["src/**/*.test.{ts,tsx}"],
    },
  };
});

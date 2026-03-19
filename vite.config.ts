import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import compression from "vite-plugin-compression";

function getPackageName(id: string): string | null {
  const afterNodeModules = id.split("node_modules/")[1];
  if (!afterNodeModules) {
    return null;
  }

  const parts = afterNodeModules.split("/");
  if (parts[0]?.startsWith("@")) {
    return parts.length > 1 ? `${parts[0]}/${parts[1]}` : parts[0];
  }

  return parts[0] ?? null;
}

function sanitizeChunkName(name: string): string {
  return name.replace(/[@/]/g, "-");
}

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
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) {
              return undefined;
            }

            const packageName = getPackageName(id);
            if (!packageName) {
              return "vendor";
            }

            if (packageName === "detect-node" || packageName === "detect-node-es") {
              return "firebase-core";
            }

            if (id.includes("/firebase/auth/") || id.includes("/@firebase/auth/")) {
              return "firebase-auth";
            }

            if (id.includes("/firebase/firestore/") || id.includes("/@firebase/firestore/")) {
              return "firebase-firestore";
            }

            if (packageName === "firebase" || packageName.startsWith("@firebase/")) {
              return "firebase-core";
            }

            if (packageName === "lucide-react") {
              return "icons";
            }

            if (packageName === "react" || packageName === "react-dom") {
              return "react-core";
            }

            if (packageName === "react-router-dom" || packageName === "@tanstack/react-query") {
              return "app-vendor";
            }

            if (packageName.startsWith("@radix-ui/")) {
              return "radix-vendor";
            }

            if (["vaul", "cmdk", "sonner", "embla-carousel-react", "react-day-picker"].includes(packageName)) {
              return "ui-vendor";
            }

            if (["react-hook-form", "@hookform/resolvers", "zod", "date-fns"].includes(packageName)) {
              return "form-vendor";
            }

            return `vendor-${sanitizeChunkName(packageName)}`;
          },
        },
      },
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

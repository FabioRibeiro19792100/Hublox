import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vercel serves public/<page>/index.html at /<page>; Vite would fall back to the SPA instead.
function servePublicPages() {
  const rewrite = (publicDir) => (req, _res, next) => {
    const [pathname, query] = req.url.split("?");
    const path = pathname.replace(/\/$/, "");
    if (path && !path.includes(".") && existsSync(join(publicDir, path, "index.html"))) {
      req.url = `${path}/index.html${query ? `?${query}` : ""}`;
    }
    next();
  };
  return {
    name: "serve-public-pages",
    configureServer(server) {
      server.middlewares.use(rewrite(server.config.publicDir));
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite(resolve(server.config.root, server.config.build.outDir)));
    },
  };
}

export default defineConfig({
  plugins: [react(), servePublicPages()],
});

import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

function versionPlugin() {
  return {
    name: 'version-json',
    writeBundle(options: { dir?: string }) {
      const outDir = options.dir || 'dist';
      const version = Date.now().toString(36);
      fs.writeFileSync(
        path.resolve(outDir, 'version.json'),
        JSON.stringify({ version })
      );
    },
    configureServer(server: { middlewares: { use: Function } }) {
      // Serve version.json in dev mode too
      server.middlewares.use('/version.json', (_req: unknown, res: { setHeader: Function; end: Function }) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ version: 'dev' }));
      });
    },
  };
}

export default defineConfig({
  plugins: [versionPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
  },
  server: {
    host: true,
    port: 3000,
  },
});

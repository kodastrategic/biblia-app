import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PACKAGE_ROOT = fileURLToPath(new URL('node_modules/piper-tts-web/dist/', import.meta.url));

const PIPER_ASSETS: { url: string; file: string }[] = [
  { url: '/onnx/ort-wasm-simd-threaded.wasm', file: 'onnx/ort-wasm-simd-threaded.wasm' },
  { url: '/piper/piper_phonemize.data', file: 'piper/piper_phonemize.data' },
  { url: '/piper/piper_phonemize.wasm', file: 'piper/piper_phonemize.wasm' },
  { url: '/worker/OnnxWebWorker.js', file: 'worker/OnnxWebWorker.js' },
  { url: '/worker/PhonemizeWebWorker.js', file: 'worker/PhonemizeWebWorker.js' },
  { url: '/worker/ExpressionWebWorker.js', file: 'worker/ExpressionWebWorker.js' },
];

function piperAssets(): Plugin {
  return {
    name: 'piper-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const entry = PIPER_ASSETS.find((a) => req.url?.split('?')[0] === a.url);
        if (!entry) return next();
        res.setHeader('Content-Type', 'application/octet-stream');
        res.end(readFileSync(path.join(PACKAGE_ROOT, entry.file)));
      });
    },
    generateBundle() {
      for (const entry of PIPER_ASSETS) {
        this.emitFile({
          type: 'asset',
          fileName: entry.file,
          source: readFileSync(path.join(PACKAGE_ROOT, entry.file)),
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), piperAssets()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
  server: {
    port: 3000,
    open: true,
  },
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import rollupNodePolyFill from 'rollup-plugin-polyfill-node';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    NodeGlobalsPolyfillPlugin({
      process: true,
      buffer: true,
    }),
    NodeModulesPolyfillPlugin(),
  ],
  define: {
    'process.env': JSON.stringify({
      NODE_ENV: 'development',
    }),
    global: 'globalThis',
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      // crypto: path.resolve(__dirname, 'node_modules/crypto-browserify'),
      stream: path.resolve(__dirname, 'node_modules/stream-browserify'),
      buffer: path.resolve(__dirname, 'node_modules/buffer'),
      process: path.resolve(__dirname, 'node_modules/process'),
      util: path.resolve(__dirname, 'node_modules/util'),
      events: path.resolve(__dirname, 'node_modules/events'),
      'readable-stream': path.resolve(__dirname, 'node_modules/readable-stream'),
      'browserify-sign': path.resolve(__dirname, 'node_modules/browserify-sign'),
    },
  },
  optimizeDeps: {
    include: [
      'buffer',
      'process',
      'events',
      'util',
      'crypto-browserify',
      'stream-browserify',
      'readable-stream',
      'browserify-sign',
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()],
    },
  },
  server: {
    port: 5173,
    host: true, // Permet l'accès via ngrok
  },
});
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/index.tsx'
    },
    typescript: {
      enabled: true
    }
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true
      }
    }
  },
  html: {
    template: './index.html'
  },
  tools: {
    bundlerChain: (chain) => {
      // 处理 PDF.js worker
      chain.module
        .rule('pdf-worker')
        .test(/pdf\.worker\.(min\.)?js/)
        .use('file-loader')
        .loader('file-loader')
        .options({
          name: '[name].[hash:8].[ext]'
        });
    }
  }
}); 
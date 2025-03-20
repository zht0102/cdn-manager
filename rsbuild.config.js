import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  output: {
    distPath: {
      root: 'dist'
    },
    assetPrefix: '/cdn-manager/'  // 添加这个配置用于 GitHub Pages
  },
  source: {
    entry: {
      index: './client/src/index.tsx'
    },
    alias: {
      '@': './client/src'
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
    template: './client/index.html'
  },
  tools: {
    bundlerChain: (chain) => {
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
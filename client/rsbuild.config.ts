import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import type { RsbuildConfig } from '@rsbuild/core';
import type { BundlerChain } from '@rsbuild/shared';

export default defineConfig({
    plugins: [pluginReact()],
    source: {
        entry: {
            index: './src/index.tsx'
        },
        typescript: {
            enabled: true,
            strict: true
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
        template: './index.html',
        mountId: 'root',
        inject: 'body',  // 确保脚本注入到正确位置
        publicPath: '/cdn-manager/'
    },
    tools: {
        bundlerChain: (chain: BundlerChain): void => {
            chain.module
                .rule('pdf-worker')
                .test(/pdf\.worker\.(min\.)?js/)
                .use('file-loader')
                .loader('file-loader')
                .options({
                    name: '[name].[hash:8].[ext]'
                });
        }
    },
    output: {
        distPath: {
            root: 'dist'
        },
        assetPrefix: '/cdn-manager/',  // 添加这个配置
        cleanDistPath: true,
    }
} as RsbuildConfig);

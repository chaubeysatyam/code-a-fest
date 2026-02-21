import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
    plugins: [tailwindcss()],
    server: {
        proxy: {
            '/api/ndma': {
                target: 'https://sachet.ndma.gov.in',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/ndma/, '/cap_public_website'),
            },
        },
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                admin: resolve(__dirname, 'admin.html'),
            },
            output: {
                entryFileNames: '[name].js',
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                        return 'style.css';
                    }
                    return '[name][extname]';
                },
                manualChunks: undefined,
            },
        },
    },
});

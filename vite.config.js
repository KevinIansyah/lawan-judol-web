import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
        minifyIdentifiers: true,
        minifySyntax: true,
        minifyWhitespace: true,
    },
    build: {
        target: 'es2020',

        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react/jsx-runtime'],
                    'vendor-inertia': ['@inertiajs/react'],
                    'vendor-utils': ['lodash', 'axios', 'clsx'],
                },
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
            },
        },

        minify: 'esbuild',
        cssMinify: true,
        sourcemap: false,
        assetsInlineLimit: 2048,
        chunkSizeWarningLimit: 500,
    },
    optimizeDeps: {
        include: ['react', 'react-dom', '@inertiajs/react'],
        exclude: [
            // Exclude heavy dev dependencies
        ],
    },

    css: {
        postcss: {
            plugins: [
                // Tambahan optimasi CSS jika diperlukan
            ],
        },
    },

    server: {
        warmup: {
            clientFiles: ['resources/js/app.tsx', 'resources/js/pages/**/*.tsx'],
        },
    },
});

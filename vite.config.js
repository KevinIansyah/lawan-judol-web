import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import cssnano from 'cssnano';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    const isProduction = mode === 'production';
    const isDevelopment = mode === 'development';

    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx'],
                ssr: 'resources/js/ssr.jsx',
                refresh: true,
            }),
            react(),
            tailwindcss(),
        ],

        build: {
            target: 'es2020',
            minify: isProduction ? 'terser' : false,
            cssMinify: isProduction ? 'lightningcss' : false,
            sourcemap: isDevelopment,
            chunkSizeWarningLimit: 1000,
            rollupOptions: {
                output: {
                    chunkFileNames: 'assets/[name]-[hash].js',
                    entryFileNames: 'assets/[name]-[hash].js',
                    assetFileNames: 'assets/[name]-[hash].[ext]',
                },
            },
        },

        optimizeDeps: {
            include: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                '@inertiajs/react',
            ],
            esbuildOptions: {
                target: 'es2020',
            },
        },

        css: {
            postcss: {
                plugins: [
                    ...(isProduction ? [cssnano()] : []),
                ],
            },
            devSourcemap: isDevelopment,
        },

        resolve: {
            dedupe: ['react', 'react-dom'],
        },

        define: {
            __DEV__: isDevelopment,
            'process.env.NODE_ENV': JSON.stringify(mode),
        },
    };
});
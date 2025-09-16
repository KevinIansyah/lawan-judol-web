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
            react({
                ...(isProduction && {
                    babel: {
                        plugins: [
                            // Remove console.log in production - install: npm i -D babel-plugin-transform-remove-console
                            // ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }]
                        ],
                    },
                }),
            }),
            tailwindcss(),
        ],

        esbuild: {
            jsx: 'automatic',
            minifyIdentifiers: true,
            minifySyntax: true,
            minifyWhitespace: true,
            drop: isProduction ? ['console', 'debugger'] : [],
            target: 'es2020',
        },

        build: {
            target: 'es2020',
            minify: 'terser',
            cssMinify: 'lightningcss',
            sourcemap: isDevelopment,
            assetsInlineLimit: 4096,
            chunkSizeWarningLimit: 400,
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                    pure_funcs: ['console.log', 'console.info'],
                    passes: 2,
                },
                mangle: {
                    safari10: true,
                },
                format: {
                    comments: false,
                },
            },
            reportCompressedSize: true,
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes('react-dom')) {
                            return 'vendor-react-dom';
                        }
                        if (id.includes('react') && !id.includes('react-dom')) {
                            return 'vendor-react';
                        }
                        if (id.includes('@inertiajs')) {
                            return 'vendor-inertia';
                        }
                        if (id.includes('recharts')) {
                            return 'vendor-recharts';
                        }
                        if (id.includes('chart') || id.includes('d3')) {
                            return 'vendor-d3';
                        }
                        if (id.includes('@radix-ui')) {
                            return 'vendor-radix';
                        }
                        if (id.includes('lucide-react')) {
                            return 'vendor-lucide';
                        }
                        if (id.includes('@headlessui')) {
                            return 'vendor-headless';
                        }
                        if (id.includes('react-hook-form') || id.includes('yup') || id.includes('zod')) {
                            return 'vendor-forms';
                        }
                        if (id.includes('date-fns') || id.includes('dayjs')) {
                            return 'vendor-date';
                        }
                        if (id.includes('lodash')) {
                            return 'vendor-lodash';
                        }
                        if (id.includes('axios')) {
                            return 'vendor-axios';
                        }
                        if (id.includes('clsx') || id.includes('tailwind-merge')) {
                            return 'vendor-styles';
                        }
                        if (id.includes('@tanstack')) {
                            return 'vendor-tanstack';
                        }
                        if (id.includes('@floating-ui')) {
                            return 'vendor-floating-ui';
                        }
                        if (id.includes('framer-motion')) {
                            return 'vendor-framer';
                        }
                        if (id.includes('node_modules')) {
                            return 'vendor-misc';
                        }
                    },
                    chunkFileNames: (chunkInfo) => {
                        if (chunkInfo.facadeModuleId && chunkInfo.facadeModuleId.includes('pages')) {
                            return 'assets/pages/[name]-[hash].js';
                        }
                        return 'assets/[name]-[hash].js';
                    },
                    entryFileNames: 'assets/[name]-[hash].js',
                    assetFileNames: 'assets/[name]-[hash].[ext]',
                },
                treeshake: {
                    preset: 'recommended',
                    manualPureFunctions: ['console.log', 'console.info'],
                },
                external: () => {
                    // return ['react', 'react-dom'] // Uncomment untuk load dari CDN
                    return false;
                },
            },
        },

        // Optimasi dependencies
        optimizeDeps: {
            include: [
                'react',
                'react-dom',
                '@inertiajs/react',
                'axios',
                'lodash',
            ],
            exclude: [
                // Exclude dependencies yang tidak perlu di pre-bundle
            ],
            esbuildOptions: {
                target: 'es2020',
            },
        },
        css: {
            postcss: {
                plugins: [
                    ...(isProduction
                        ? [
                              cssnano({
                                  preset: [
                                      'default',
                                      {
                                          discardComments: { removeAll: true },
                                          normalizeWhitespace: true,
                                      },
                                  ],
                              }),
                          ]
                        : []),
                ],
            },
            devSourcemap: isDevelopment,
        },
        server: {
            warmup: {
                clientFiles: ['resources/js/app.tsx', 'resources/js/pages/**/*.tsx', 'resources/js/components/**/*.tsx'],
            },
        },
        define: {
            __DEV__: isDevelopment,
            'process.env.NODE_ENV': JSON.stringify(mode),
        },
    };
});

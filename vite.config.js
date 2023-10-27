import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        proxy: {
            '/mojiapi': {
                target: 'https://api.mojidict.com',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/mojiapi/, ''),
            },
            '/googletrans_api': {
                target: 'https://translate.googleapis.com',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/googletrans_api/, ''),
                ws: true,
            },
            '/googletrans': {
                target: 'https://clients5.google.com/translate_a/',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/googletrans/, ''),
            }, 
        },
    },
})

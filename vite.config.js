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
        },
    },
})

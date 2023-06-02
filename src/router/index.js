// 导入Vue和Vue Router
import { createRouter, createWebHistory } from 'vue-router';

// 导入页面组件
import MainView from '../views/MainView.vue';
import ChatView from '../views/ChatView.vue';

// 创建路由实例
const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: MainView },
        { path: '/chat', component: ChatView },
    ]
});

// 导出路由实例
export default router;
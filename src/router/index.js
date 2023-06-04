// 导入Vue和Vue Router
import { createRouter, createWebHistory } from 'vue-router';

// 导入页面组件
import MainView from '../views/MainView.vue';
import DictView from '../views/DictView.vue';

// 创建路由实例
const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: MainView },
        { path: '/dict', component: DictView },
    ]
});

// 导出路由实例
export default router;
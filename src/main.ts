// 引入 Vue 核心库
import { createApp } from 'vue';

// 引入第三方库及其样式
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

// 引入本地组件
import App from './App.vue';

// 创建 Vue 应用实例
const app = createApp(App);

// 使用 Element Plus 插件
app.use(ElementPlus);

// 挂载应用到 DOM
app.mount('#app');
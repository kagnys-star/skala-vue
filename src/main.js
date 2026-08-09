import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// use(router)로 라우터 인스턴스를 앱 전역에 주입한다.
// 이 한 줄이 있어야 어느 컴포넌트에서든 <RouterLink> / <RouterView> / useRouter()를 쓸 수 있다.
createApp(App).use(router).mount('#app')

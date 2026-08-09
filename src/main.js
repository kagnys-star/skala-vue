import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// use(pinia) / use(router)로 각 인스턴스를 앱 전역에 주입한다.
// pinia를 먼저 등록하는 이유: 라우터 가드에서 스토어를 꺼내 쓰게 되더라도
// 그 시점에 pinia가 이미 준비되어 있어야 하기 때문이다.
createApp(App).use(createPinia()).use(router).mount('#app')

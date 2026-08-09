import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: '/skala-vue/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    watch: {
      // Docker 컨테이너 안에서 개발할 때 필요한 설정.
      // 호스트(Windows) 폴더를 컨테이너에 bind mount하면 파일 변경 이벤트(inotify)가
      // 컨테이너 안까지 전달되지 않는다. 그래서 파일을 고쳐도 Vite가 눈치채지 못하고
      // 예전에 캐시해 둔 코드를 계속 내려준다. (HMR도, 새로고침도 소용없다)
      // 주기적으로 직접 확인하는 폴링 방식으로 바꿔야 변경이 감지된다.
      usePolling: true,
      interval: 300,
    },
  },
})

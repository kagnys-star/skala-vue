import { fileURLToPath, URL } from 'node:url'
import { copyFileSync, existsSync } from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

/**
 * GitHub Pages용 404.html 생성 플러그인.
 *
 * 문제: 이 앱은 History 모드 라우터를 쓴다. '/skala-vue/about' 같은 주소는
 * 서버에 실제로 존재하는 파일이 아니라, index.html이 뜬 뒤 라우터가 그려주는 화면이다.
 * 앱 안에서 링크로 이동할 때는 문제가 없지만, 그 주소를 직접 입력하거나 새로고침하면
 * 브라우저가 서버에 '/skala-vue/about' 파일을 달라고 요청한다.
 * 일반 서버라면 '없는 경로는 전부 index.html로 돌려줘'라고 설정하면 되는데,
 * GitHub Pages는 정적 호스팅이라 그런 설정을 할 수 없고 404를 내보낸다.
 *
 * 해결: Pages는 없는 경로에 대해 404.html을 돌려준다.
 * 그래서 404.html을 index.html과 똑같이 만들어 두면, 결과적으로 앱이 뜨고
 * 라우터가 주소를 보고 알맞은 화면을 그린다.
 *
 * 빌드할 때마다 에셋 파일 이름(해시)이 바뀌므로 미리 만들어 둘 수 없고,
 * 빌드가 끝난 뒤 생성된 index.html을 복사해야 한다.
 */
const spaFallbackPlugin = () => ({
  name: 'generate-spa-fallback',
  // 개발 서버에는 필요 없다. (dev 서버는 알아서 index.html로 돌려준다)
  apply: 'build',
  // closeBundle: 산출물이 디스크에 모두 기록된 뒤 실행된다.
  closeBundle() {
    const indexPath = fileURLToPath(new URL('./dist/index.html', import.meta.url))
    const fallbackPath = fileURLToPath(new URL('./dist/404.html', import.meta.url))

    if (!existsSync(indexPath)) {
      console.warn('[spa-fallback] dist/index.html이 없어 404.html을 만들지 못했습니다.')
      return
    }

    copyFileSync(indexPath, fallbackPath)
    console.log('[spa-fallback] dist/404.html 생성 완료')
  },
})

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages는 https://<사용자>.github.io/<저장소>/ 경로에 배포되므로
  // 에셋 경로 앞에 저장소 이름이 붙어야 한다.
  base: '/skala-vue/',
  plugins: [vue(), vueDevTools(), spaFallbackPlugin()],
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

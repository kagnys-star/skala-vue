import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

/**
 * ESLint 설정 (Flat Config).
 *
 * 배열의 뒤쪽 항목이 앞쪽을 덮어쓴다. 그래서
 * '무시할 경로 → 기본 규칙 → Vue 규칙 → 우리 규칙' 순서로 쌓는다.
 */
export default [
  {
    // 검사할 필요가 없는 경로. 빌드 산출물과 의존성은 우리가 쓴 코드가 아니다.
    ignores: ['dist/**', 'node_modules/**'],
  },

  // JavaScript 기본 권장 규칙 (미사용 변수, 중복 선언 등)
  js.configs.recommended,

  // Vue 3 SFC 권장 규칙. .vue 파일의 <template>까지 파싱해서 검사해 준다.
  ...pluginVue.configs['flat/recommended'],

  {
    files: ['**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // 브라우저에서 도는 코드다. console, document, localStorage, setInterval 등을
        // 선언 없이 써도 'undefined 변수' 오류가 나지 않도록 알려준다.
        ...globals.browser,
      },
    },
    rules: {
      // App.vue 처럼 한 단어짜리 이름을 허용한다.
      // 이 규칙의 목적은 사용자 컴포넌트가 표준 HTML 태그와 충돌하는 것을 막는 것인데,
      // 최상위 App은 태그로 쓰이지 않으므로 예외로 둔다.
      'vue/multi-word-component-names': ['error', { ignores: ['App'] }],

      // 쓰지 않는 변수는 오류로 잡는다. 다만 '_'로 시작하는 이름은
      // '일부러 안 쓰는 값'이라는 관례이므로 통과시킨다.
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // 디버깅용 console은 남겨둔다. 이 프로젝트는 watch/emit 동작을 콘솔로 확인하는 실습이다.
      'no-console': 'off',
    },
  },
]

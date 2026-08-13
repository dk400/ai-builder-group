#!/usr/bin/env node
/*
 * 커밋 전 게이트. 통과 못 하면 커밋하지 않는다.
 * 실행: npm run verify
 *
 * next build 하나로 충분한 이유
 *   Next.js 16 의 build 는 TypeScript 검사와 정적 생성을 같이 돌린다.
 *   타입은 통과하는데 프리렌더에서 죽는 경우(서버 컴포넌트에서 window 접근 등)가
 *   실제로 자주 나오므로, tsc 만 돌리는 것으로는 부족하다.
 */
const { execFileSync } = require('child_process');
const { APP_DIR, ensureDeps } = require('./app-dir');

ensureDeps();

console.log('▸ next build (TypeScript 검사 + 정적 생성 포함)');
try {
  execFileSync('npm', ['run', 'build'], { cwd: APP_DIR, stdio: 'inherit', shell: true });
} catch {
  console.error('\n✗ 빌드 실패. 위 출력을 보고 고친 뒤 다시 실행하세요.');
  process.exit(1);
}

console.log('\n✓ 검증 통과 — 커밋해도 됩니다.');

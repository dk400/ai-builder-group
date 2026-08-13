#!/usr/bin/env node
/*
 * 앱은 저장소 루트가 아니라 05-서비스-nextjs/ 안에 있다.
 * 루트에서 친 명령을 그쪽으로 넘겨준다 — 매번 cd 하다 보면
 * 루트에서 next 명령을 쳐놓고 왜 안 되는지 찾는 시간이 생긴다.
 *
 * 실행: node scripts/run.js <dev|build|start>
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const { APP_DIR, ensureDeps } = require('./app-dir');

const task = process.argv[2];
if (!['dev', 'build', 'start'].includes(task)) {
  console.error('사용법: node scripts/run.js <dev|build|start>');
  process.exit(1);
}

if (!fs.existsSync(APP_DIR)) {
  console.error('앱 폴더를 찾을 수 없습니다: ' + APP_DIR);
  process.exit(1);
}

ensureDeps();

/* Windows 의 npm 은 npm.cmd 라 shell 없이는 실행되지 않는다 (Node 24 부터 EINVAL).
   여기서 넘기는 인자는 위에서 화이트리스트로 검사한 값뿐이라 외부 입력이 섞이지 않는다. */
try {
  execFileSync('npm', ['run', task], { cwd: APP_DIR, stdio: 'inherit', shell: true });
} catch {
  process.exit(1);
}

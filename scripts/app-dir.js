/*
 * 앱 폴더 경로를 한 곳에서만 정한다.
 * 폴더 이름이 한글(05-서비스-nextjs)이라 셸에 그대로 박아 넣으면 인코딩 문제가 생긴다.
 * 스크립트끼리 문자열을 복사하지 말고 여기서 가져다 쓸 것.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/* Windows 의 npm 은 npm.cmd 라 shell:true 없이는 실행되지 않는다 (Node 24 부터 EINVAL).
   그 대가로 DEP0190 경고가 뜬다. 여기서 넘기는 인자는 전부 이 저장소 안에 적힌 상수뿐이고
   외부 입력이 섞이지 않으므로 경고만 끈다. 사용자 입력을 인자로 넘기게 되는 날에는
   이 줄을 지우고 shell 없이 실행할 방법을 다시 찾아야 한다. */
process.noDeprecation = true;

const ROOT = path.resolve(__dirname, '..');
const APP_DIR = path.join(ROOT, '05-서비스-nextjs');

/* 의존성이 없으면 build 가 "next: not found" 로 죽는다.
   에러 메시지만 보면 원인이 안 보이므로 여기서 먼저 설치한다. */
function ensureDeps() {
  if (fs.existsSync(path.join(APP_DIR, 'node_modules'))) return;
  console.log('▸ node_modules 가 없습니다. npm install 부터 실행합니다.');
  execFileSync('npm', ['install'], { cwd: APP_DIR, stdio: 'inherit', shell: true });
}

module.exports = { ROOT, APP_DIR, ensureDeps };

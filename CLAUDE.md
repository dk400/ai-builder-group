# CLAUDE.md

Claude Code 가 이 저장소에서 작업할 때 따르는 지침입니다.

**먼저 `README.md` 를 읽으세요.** 폴더 구조 · 페이지 구성 패턴 · 절대 규칙 · 문서 읽는 순서가
거기 있습니다. 이 문서는 그 위에 얹히는, **이 포크에만 해당하는 규칙**입니다.

---

## 이 저장소의 정체

`honghong-art/ai-builder-group` 을 클론한 사본입니다. 원작자는 팀원이고, 원본은 계속 갱신됩니다.

```
origin     내 저장소 (dk400)          ← 커밋 · 푸시는 전부 이쪽
upstream   honghong-art/ai-builder-group  ← 받아오기 전용. 절대 푸시하지 않는다
```

`upstream` 으로 푸시하면 남의 저장소를 덮어씁니다. 실수로라도 하지 마세요.

원작자 갱신을 받아올 때:

```bash
git fetch upstream
git log --oneline HEAD..upstream/main     # 무엇이 새로 들어왔는지 먼저 본다
git merge upstream/main
```

---

## 하드 룰

### 1. 원작자 소스 파일은 함부로 고치지 않는다

`05-서비스-nextjs/app/**`, `05-서비스-nextjs/components/**`, `01-기획/`, `02-화면설계/`,
`03-백로그/`, `04-목업-old/`, `99-참고자료/`, `README.md` 는 원작자가 쓴 것입니다.

고쳐야 한다면:

- **왜 고쳤는지 커밋 메시지에 남깁니다.** upstream 을 머지할 때 정확히 그 줄에서 충돌합니다.
  이유가 없으면 나중에 어느 쪽을 살릴지 판단할 수 없습니다.
- 되도록 **파일을 새로 만들어 얹는 쪽**을 고릅니다. 같은 파일을 양쪽에서 고치는 게 가장 비쌉니다.

루트의 `CLAUDE.md` · `.gitignore` · `package.json` · `scripts/` 는 이 포크에서 추가한 것이라
자유롭게 고쳐도 됩니다.

### 2. `05-서비스-nextjs/AGENTS.md` 는 지우지 않는다

`next dev` 가 자동으로 다시 써넣습니다. 지워도 되살아나면서 작업 트리만 더러워집니다.
(`CLAUDE.md` 가 `@AGENTS.md` 한 줄인 것도 같은 이유입니다.)

### 3. 검증 통과 못 한 것을 "완료"라고 하지 않는다

```bash
npm run verify     # next build — TypeScript 검사 + 13개 라우트 정적 생성
```

실패했으면 실패했다고 출력과 함께 보고합니다.

### 4. 이미지는 전부 시연용 샘플이다

`05-서비스-nextjs/public/assets/img/` 의 69개 파일 — 고객사 로고(카카오 · 신한 · 크래프톤 …),
인물 아바타, work 썸네일 — 은 **서면 동의를 받지 않은 샘플**입니다 (README §절대 규칙).
실제 공개 배포 전에 교체하거나 동의를 받아야 합니다. 새 로고·인물 사진을 임의로 추가하지 마세요.

---

## 작업 위치

앱은 저장소 루트가 아니라 **`05-서비스-nextjs/`** 안에 있습니다. 루트에서 `next` 명령을 치면
동작하지 않습니다. 루트 스크립트가 알아서 넘겨줍니다.

```bash
npm run dev        # 개발 서버 (http://localhost:3000)
npm run build      # 프로덕션 빌드
npm run verify     # 커밋 전 게이트
```

`node_modules` 가 없으면 스크립트가 먼저 설치합니다.

---

## 배포

`main` 에 푸시하면 Vercel 이 프로덕션으로 배포합니다 (2026-08-20 부터 GitHub 연동).
`feat/*` 푸시는 프리뷰 URL 이 자동으로 생깁니다.

```
GitHub      dk400/ai-builder-group        ← 연결된 저장소
Vercel      ai-builder-school / ai-builder-group-dk
프로덕션     https://ai-builder-group-dk.vercel.app
```

프로젝트 설정 두 개가 **이 저장소 구조에 맞춰 손으로 맞춰져 있습니다. 바꾸지 마세요.**

| 설정 | 값 | 이유 |
|---|---|---|
| Root Directory | `05-서비스-nextjs` | 앱이 루트가 아니라 이 폴더 안에 있습니다 |
| Include files outside the root directory | **Disabled** | 켜면 빌드 컨텍스트가 저장소 루트가 됩니다 |

### 🔴 한글 폴더 이름과 Turbopack

앱이 **한글이 든 폴더**(`05-서비스-nextjs`) 안에 있습니다. Turbopack 은 경로 문자열을
바이트 단위로 자르는 코드가 있어서, 버전에 따라 한글 글자 중간을 쪼개고 죽습니다.

```
FATAL: An unexpected Turbopack error occurred:
start byte index 10 is not a char boundary; it is inside '스' (bytes 9..12 of string)
```

**Next 16.3.0 에서 실제로 프로덕션 빌드가 두 번 깨졌고, 16.3.1 에서 고쳐져 있습니다.**
그래서 `next` · `react` · `react-dom` 의 버전을 `latest` 에서 **고정으로 바꿨습니다.**

- **`latest` 로 되돌리지 마세요.** 락파일과 어긋나는 순간 로컬과 CI 가 다른 버전으로
  빌드하고, 그 차이는 배포가 깨지고 나서야 드러납니다 (실제로 그렇게 드러났습니다).
- Next 를 올릴 때는 **배포까지 확인**하세요. 로컬 `npm run build` 통과가 증거가 되지
  않습니다 — 로컬은 앱 폴더 안에서 돌아서 상대 경로에 한글이 안 들어갑니다.
- 폴더 이름을 영문으로 바꾸는 선택지는 남아 있지만, 문서·스크립트·설정이 전부 따라
  바뀌어야 하므로 최후의 수단입니다.

---
## 코드 규칙

전체는 `README.md` §페이지 구성 패턴. 요약:

- 라우트 하나 = `page.tsx`(서버 · metadata) + `view.tsx`(`'use client'` · 마크업) + `<route>.css`
- 공용 인터랙션은 이미 있습니다. 페이지마다 다시 만들지 마세요 —
  `components/SiteFx.tsx`(스크롤 리빌 `.rv`/`.mask`, GA4 `[data-track]`, 커서 추종 `[data-cursor]`),
  `components/fx.ts`(`useRibbonFlow`, `useDock`)
- `app/style.css` 는 전역입니다. 고치면 전 페이지에 영향이 갑니다
- 커밋은 Conventional Commits

---

## 참고용 저장소

`C:\Users\USER\Desktop\AI-Builder-Origin` — 같은 브랜드로 먼저 만든 단일 파일 정적 시안입니다.
**드랍된 코드이므로 가져다 쓰지 않습니다.** 인터랙션 구현이나 카피를 참고할 때만 엽니다.

---

## 소통

- **한국어로 답합니다.** 코드 주석과 커밋 메시지는 영어 혼용 가능.
- 결론 먼저. 옵션을 나열하기보다 추천안을 제시하세요.
- 확인하지 않은 것을 확인했다고 말하지 마세요. 검증 명령의 실제 출력으로 뒷받침하세요.

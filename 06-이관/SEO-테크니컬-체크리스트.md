# SEO 테크니컬 체크리스트

| | |
|---|---|
| 작성일 | 2026-08-20 (목) |
| 근거 | PRD **§9 (SR-01 ~ SR-09)** · 백로그 §2-5 |
| 원칙 | 🔒 **스스로 늘리지 않는다.** 아래 표 밖의 SEO 작업은 범위 밖이다 (SR-09) |

---

## 1. 요구사항별 현황

| ID | 요구사항 | 상태 | 근거 · 위치 |
|---|---|:--:|---|
| **SR-01** | 목록·상세 서버 렌더링 (SSG+ISR) | ✅ | 전 라우트 정적 생성. JS 를 꺼도 본문이 HTML 에 있다 |
| **SR-02** | 페이지별 타이틀·디스크립션·OG·트위터 카드 (중복 0) | ✅ | `app/_meta.ts` 의 `pageMeta()` 한 곳에서 조립. 빌드 산출물에서 타이틀 중복 0건 확인 |
| **SR-03** | `sitemap.xml` / `robots.txt` / `llms.txt` | ✅ | `app/sitemap.ts` · `app/robots.ts` · `app/llms.txt/route.ts`. 셋 다 `/submit` · `/admin/*` · `/image-guide` 제외 |
| **SR-04** | JSON-LD 3종 | ✅ | `app/_jsonld.ts` — Organization(전 페이지) · Article(Insight 상세) · BreadcrumbList(상세). Work 상세는 CreativeWork ※ |
| **SR-05** | canonical 자기 URL · 외부 canonical 금지 | ✅ | `pageMeta()` 의 `alternates.canonical`. 외부 도메인 canonical 0건 |
| **SR-06** | 슬러그 변경 시 301 자동 생성 | 🟡 | 지금은 `next.config.mjs` 의 `redirects()` 수동 관리(2건). 어드민 붙으면 `redirects` 테이블로 이관 |
| **SR-07** | 이미지 최적화 (AVIF/WebP · 지연 로드 · 크기 지정) | 🟡 | 지연 로드 ✅(`loading="lazy"`) · 크기 지정 ✅(CSS 가 박스를 먼저 잡아 CLS 유발 없음) · **AVIF/WebP ❌** — 107장 전부 jpg/png |
| **SR-08** | 구글 + 네이버, 🔒 클라이언트 명의 등록 | ⬜ | 도메인 확정 후. 아래 §3 |
| **SR-09** | GEO·AEO 별도 대응 · 백링크 · 대량 발행 **안 함** | ✅ | 하지 않았다. 늘리지 않는다 |

> ※ **Work 상세를 Article 로 내지 않은 이유** — Article 은 발행일이 핵심 속성인데 Work
> 데이터에는 연도밖에 없다. `2026-01-01` 같은 값을 채우면 검색엔진에 거짓 날짜를 주는 것이
> 된다. 포트폴리오 항목의 정확한 타입은 CreativeWork 다. Article 은 실제 글인 Insight 상세가
> 낸다 — SR-04 가 요구한 3종은 사이트에 모두 존재한다.

---

## 2. SR-07 — AVIF/WebP 를 지금 하지 않는 이유

**이미지 107장이 전부 교체 대상이기 때문이다.** 지금 들어 있는 파일은 고객사 로고·인물
아바타를 포함한 **서면 동의 없는 시연용 샘플**이고, 실제 에셋으로 갈아끼우기로 되어 있다.
지금 변환하면 버릴 파일을 변환하는 셈이다.

**실에셋 교체와 같은 작업으로 묶어서 한다.** 두 가지 길이 있다:

| 방법 | 작업량 | 주의 |
|---|---|---|
| **A. `next/image` 로 전환** (권장) | `<img>` 33곳 교체 | Next 가 AVIF/WebP 를 자동 생성·협상한다. 다만 `object-fit: cover` + `inset: 0` 로 짜인 박스가 많아 **레이아웃 회귀 위험이 있다 — 실기기에서 확인해야 한다** |
| B. 원본을 webp 로 변환해 교체 | 이미지 파일만 | 코드 변경 없음. AVIF 는 못 얻고, 브라우저별 협상도 없다 |

지연 로드와 크기 지정은 이미 충족돼 있다 — 썸네일은 `position:absolute; inset:0` 인 박스
안에 있거나 `aspect-ratio` 가 걸려 있어서 **이미지가 늦게 와도 자리가 흔들리지 않는다.**
즉 SR-07 의 CLS 인수 조건(≤ 0.1)은 형식과 무관하게 이미 지켜지는 구조다.

---

## 3. 도메인 확정 후 할 일 (SR-08)

```
1. NEXT_PUBLIC_SITE_URL = https://<실도메인>   → Vercel 환경변수 · 재배포
   (canonical · og:url · og:image · sitemap · robots · llms.txt 가 전부 이 값을 따라온다)
2. Vercel > Domains 에 도메인 연결
3. Google Search Console — 🔒 클라이언트 계정으로 속성 등록
     소유 확인: DNS TXT 권장 (파일 업로드 방식은 재배포 때 사라질 수 있다)
     사이트맵 제출: https://<도메인>/sitemap.xml
4. 네이버 서치어드바이저 — 🔒 클라이언트 계정
     사이트 등록 → 소유 확인 → 사이트맵 제출 → robots.txt 확인
5. 우리 계정은 "제한된 사용자"로만 추가받는다 (하자보수 기간)
```

🔴 **2번(도메인 연결) 전에 3·4번을 하지 않는다.** Vercel 임시 도메인이 canonical 인 상태로
색인되면, 실도메인으로 바꾼 뒤 중복 콘텐츠를 다시 정리해야 한다.

---

## 4. 발행 전 확인 명령

```bash
D=https://<도메인>

curl -s $D/robots.txt                      # Disallow: /image-guide · /admin + sitemap 위치
curl -s $D/sitemap.xml | grep -c '<url>'   # 정적 8 + Work 9 + Insight 11 = 28 (2026-08-20 기준)
curl -s $D/llms.txt | head -20
curl -s $D/submit  | grep -o 'name="robots"[^>]*'   # noindex 여야 한다
curl -s $D/admin   | grep -o 'name="robots"[^>]*'   # noindex 여야 한다
curl -s $D/ | grep -o '<link rel="canonical"[^>]*>' # 실도메인이어야 한다
```

**리치 결과 테스트** (SR-04 인수 조건) — 아래 3개 주소를 각각 넣고 오류 0건을 확인한다.
경고는 통과다.

```
https://search.google.com/test/rich-results
  · 홈                → Organization
  · /insight/<슬러그> → Article + BreadcrumbList + Organization
  · /work/<슬러그>    → CreativeWork + BreadcrumbList + Organization
```

**Lighthouse** (NFR-02 — 모바일 성능 ≥ 85 / 접근성 ≥ 95 / SEO 100) 는 홈 · Work 상세 ·
Insight 상세 세 곳에서 잰다. ⚠ 아직 실기기·실도메인에서 측정하지 않았다. 도메인 연결 후
측정하고 결과를 여기에 적는다.

| 화면 | 성능 | 접근성 | SEO | 측정일 |
|---|:--:|:--:|:--:|---|
| 홈 | | | | ⬜ |
| Work 상세 | | | | ⬜ |
| Insight 상세 | | | | ⬜ |

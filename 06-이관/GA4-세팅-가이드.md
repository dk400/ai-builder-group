# GA4 세팅 가이드 — 측정 ID · 이벤트 규약 · 검증

| | |
|---|---|
| 작성일 | 2026-08-20 (목) |
| 근거 | PRD **§8 (TR-01 ~ TR-06)** · IR-05 · 백로그 §2-3 |
| 코드 | `05-서비스-nextjs/app/_track.ts` (공통 래퍼) · `components/Analytics.tsx` (로더) |

> **성공 조건 ②가 "전환 트래킹이 가능한 구조"다.** URL 슬러그를 분기한 목적도 SEO 가 아니라
> 트래킹이었다(TR-01 원칙). 화면만 바뀌고 주소가 그대로면 요구사항 미충족으로 판정된다.

---

## 1. 켜는 법 — 5분

```
1. 🔒 클라이언트 GA4 계정에서 속성 생성  (TR-01 — 우리 계정을 만들지 않는다)
2. 관리 > 데이터 스트림 > 웹 > 스트림 추가 > 사이트 URL 입력
3. 측정 ID 복사 (G- 로 시작)
4. Vercel > Settings > Environment Variables
     NEXT_PUBLIC_GA_ID = G-XXXXXXXXXX     ← Production · Preview 양쪽
5. 재배포
```

**비워두면 gtag.js 를 아예 싣지 않는다.** 개발·프리뷰 트래픽이 실계정 지표에 섞이지 않게
한 것이고, 채널톡·pluug 과 같은 규칙이다(키가 없으면 연동만 꺼지고 사이트는 그대로 돈다).

```bash
# 켜졌는지 확인
curl -s https://<도메인>/ | grep -o 'googletagmanager[^"]*'
```

### GTM 을 쓸 경우

지금 코드는 **gtag.js 직접 연결**이다. GTM 을 경유하려면 컨테이너 스니펫을
`components/Analytics.tsx` 에 얹고, GTM 안에서 GA4 구성 태그를 만든 뒤 `dataLayer` 로
들어오는 커스텀 이벤트 7종을 트리거로 잡는다. **이벤트 이름과 파라미터는 그대로 쓸 수 있다** —
`app/_track.ts` 가 이미 `dataLayer` 에 밀어 넣는 방식이라 전송 계층만 바뀐다.

---

## 2. 이벤트 규약 (TR-02) — 7종

| 이벤트 | 파라미터 | 발화 지점 | 코드 |
|---|---|---|---|
| `page_view` | `page_location` · `page_path` · `page_title` | 전 페이지 + **라우트 전환마다** | `components/Analytics.tsx` |
| `cta_click` | `location` | 문의 CTA 전체 | 마크업 `[data-track]` 위임 |
| `work_detail_view` | `slug` · `category` | P-03 진입 | `app/work/[slug]/view.tsx` |
| `insight_detail_view` | `slug` · `category` · `author_type` | P-05 진입 | `app/insight/[slug]/view.tsx` |
| `youtube_outbound` | `video_id` · `utm_campaign` | `/content` → 유튜브 | 마크업 `[data-track]` 위임 |
| `faq_topic_change` | `topic` | FAQ 토픽 전환 | `components/FaqList.tsx` |
| ★ `contact_submit` | `verified` | `/submit` 도달 | `app/submit/view.tsx` |

**확장 3종** (규약 밖 — 인수 조건과 구분해서 본다): `youtube_channel_click`(채널 구독 배너) ·
`builder_click`(Work → 빌더) · `chat_start`(채널톡 대화 시작).

이벤트 이름은 `TrackEvent` 유니온 타입으로 고정돼 있다. **여기 없는 이름은 타입이 막는다** —
규약에 없는 이벤트가 슬쩍 늘어나는 것이 측정 설계가 무너지는 첫 단계다. 늘려야 하면
PRD §8.2 를 먼저 고친다.

### `cta_click` 의 `location` 값 (전수)

PRD 는 5곳(`gnb` · `hero` · `footer_cta` · `work_detail` · `insight_detail`)을 명시했고,
**다섯 값은 전부 그대로 있다.** 사이트가 자라면서 아래 7개가 더 붙었다:

```
gnb · hero · hero_secondary · footer_cta · floating · match_section
work_detail · work_match · insight_detail · faq_bottom
builder_profile · builder_profile_bottom
```

GA4 에서 5개만 보고 싶으면 `location` 차원에 필터를 건다. 전체를 보면 "어느 자리의 버튼이
실제로 전환을 만드는가"가 나온다 — 원래 이 파라미터를 넣은 이유다.

---

## 3. UTM 규격 (TR-05 · TR-06)

```
?utm_source=<NEXT_PUBLIC_UTM_SOURCE>   기본 ai-builder-group
&utm_medium=content | insight | work | website
&utm_campaign=<영상 ID 또는 아티클 슬러그>
&utm_content=hero_card | list_item | related | featured | channel_tab
```

**생성은 `app/_integrations.ts` 의 `utmUrl()` · `youtubeWatchUrl()` 두 함수만 한다**
(TR-06 — 수기 문자열 금지). 유튜브로 나가는 링크는 영상 7개 + 채널 3개 **전수**에 붙어 있다.

```bash
# 하드코딩된 UTM 이 없는지 (0건이어야 한다)
grep -rn 'utm_source=' 05-서비스-nextjs/app 05-서비스-nextjs/components | grep -v _integrations.ts
```

### 이번에 바로잡은 것 — 확인이 필요한 두 가지

| # | 무엇 | 판단 |
|:--:|---|---|
| 1 | **`utm_source` 가 두 값이었다.** 홈 S8 에 `builder-group` 이 문자열로 박혀 있었고 환경변수는 `ai-builder-group` 이었다 — 한 사이트가 GA4 에서 둘로 집계되던 상태 | 환경변수를 단일 원천으로 통일. **PRD §8.3 문구는 `builder-group`** 이라 어느 쪽을 정본으로 할지 확인 필요. pluug 리드가 이미 `ai-builder-group` 으로 쌓이는 중이라 그쪽에 맞췄다 |
| 2 | `utm_campaign` 을 PRD 는 "영상 주제"로 적었지만 데이터에 주제 필드가 없다 | **영상 ID** 를 넣었다. 지어낸 주제어보다 안정적이고 YouTube 리포트와도 맞는다. 주제 라벨이 필요하면 `VIDEOS` 배열에 `campaign` 필드를 더한다 |

---

## 4. 발행 전 검증 (TR-02 인수 조건 — DebugView 전수 확인)

GA4 > 관리 > **DebugView** 를 열어 두고, 실제 배포본에서 아래를 한 번씩 한다.
(Chrome 확장 *Google Analytics Debugger* 를 켜면 프로덕션에서도 DebugView 에 잡힌다.)

| # | 할 것 | 잡혀야 하는 것 |
|:--:|---|---|
| 1 | 홈 진입 | `page_view` (`page_path=/`) |
| 2 | 홈 → Work → Insight 로 **클릭 이동** | `page_view` 가 **이동할 때마다** 추가로 발화 |
| 3 | Work 카드 클릭 → 상세 | `work_detail_view` (`slug` · `category`) |
| 4 | Insight 카드 클릭 → 상세 | `insight_detail_view` (`slug` · `category` · `author_type`) |
| 5 | GNB · 히어로 · 푸터 문의 버튼 | `cta_click` 각각 `location=gnb` / `hero` / `footer_cta` |
| 6 | `/faq` 토픽 탭 전환 | `faq_topic_change` (`topic`) |
| 7 | `/content` 영상 카드 클릭 | `youtube_outbound` (`video_id` · `utm_campaign`) + 새 탭이 유튜브로 열림 |
| 8 | **pluug 폼 제출 → `/submit?src=pluug` 도달** | ★ `contact_submit` (IR-02 — **E2E 1회 실증 필수**) |

> 🔴 **8번은 반드시 실제로 한 번 제출해 본다.** pluug 의 "제출 후 이동 링크"가 `/submit` 이
> 아니면 전환이 0으로 남고, 그 사실은 몇 주 뒤 리포트를 볼 때가 되어야 드러난다.
> `?src=pluug` 토큰이 없으면 발화하지 않는다 — 완료 화면 주소를 직접 열어본 사람이
> 전환으로 세어지는 것을 막는 장치다.

### 전환(키 이벤트) 설정

GA4 > 관리 > **이벤트** > `contact_submit` > **키 이벤트로 표시**.
이 스위치를 켜야 전환수가 리포트에 뜬다. 안 켜면 이벤트는 쌓이는데 전환은 계속 0이다.

---

## 5. 알아 둘 것

- **`page_view` 를 손으로 쏜다.** App Router 는 화면을 바꿔도 문서를 다시 불러오지 않아서
  gtag 자동 발화가 첫 진입 1회만 잡힌다. 그대로 뒀다면 홈 이후의 모든 경로가 통째로
  사라졌을 것이다. 자동 발화(`send_page_view`)는 꺼져 있으니 GA4 설정에서 다시 켜지 않는다 —
  켜면 첫 화면만 두 번 세어진다.
- **`work_detail_view` · `insight_detail_view` 는 8/20 이전 배포본에서 발화하지 않았다.**
  래퍼가 페이지보다 늦게 정의되던 버그였다. 그 이전 기간의 상세 조회수는 없는 것이 맞고,
  `page_view` 로 대신 봐야 한다.
- **홈 S8 영상 카드는 `youtube_outbound` 를 쏘지 않는다.** 그 카드는 유튜브가 아니라
  `/content` 로 간다. 예전에는 쏘고 있어서 "유튜브에 가지 않은 클릭"이 아웃바운드 지표에
  섞였다(첫 카드는 2회 중복 발화). 홈 → 콘텐츠 이동은 `/content` 의 `page_view` 로 본다.

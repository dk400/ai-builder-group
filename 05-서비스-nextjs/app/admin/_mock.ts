/* 어드민 목업이 쓰는 파생 데이터.

   상태(status)·수정일·작성자는 아직 어디에도 저장되지 않는다 — 2단계에서 works·insights
   테이블의 컬럼이 된다. 그때까지 화면을 채우려고 여기서 슬러그에 상태를 붙여 둔다.

   랜덤이 아니라 고정 표인 이유 — 새로고침마다 상태가 바뀌면 리뷰가 불가능하고, 빌드마다
   결과가 달라지면 정적 생성과도 안 맞는다. 다섯 가지 상태가 모두 한 번씩은 보이도록 골랐다.

   ⚠ 이 파일은 2단계에서 통째로 사라진다. 공개 화면은 이 파일을 import 하지 않는다. */

import { WORKS, type Work } from '@/app/_works'
import { ARTICLES, type Article } from '@/app/_insights'
import { BUILDERS, builderBySlug } from '@/app/_builders'

/* 상태 머신은 목업 소유가 아니다. 이 파일은 4단계에서 사라지지만 상태 규칙은 남는다 —
   정의는 ./_transitions.ts 한 곳이고 여기서는 다시 내보내기만 한다.
   (같은 유니온을 두 곳에 적어 두면 한쪽만 고쳐지는 날이 온다) */
export type { Status } from './_transitions'
export { STATUS_LABEL, STATUS_ORDER } from './_transitions'
import type { Status } from './_transitions'

const INSIGHT_STATUS: Record<string, Status> = {
  '바이브코딩-외주-고르는법': 'published',
  /* 공개 사이트에 이미 나가 있는 글이다. 'pending' 으로 두면 어드민 상태와 실제
     노출이 어긋나고, 데모의 승인대기 샘플과도 중복된다 */
  '3주-랜딩페이지-제작순서': 'published',
  'ai툴-실무도입-검증기준': 'draft',
  'ai-poc-도입전-검증': 'published',
  'ai에이전트-도입-체크리스트': 'published',
  'ai도입-ax-차이-업무설계': 'published',
  '기업ai-도입-거버넌스': 'rejected',
  '개발외주-견적-비교법': 'published',
  '외주개발-턴키팀-이유': 'published',
  '토스-미니게임-프로젝트': 'archived',
  'ai네이티브-에이전시-운영법': 'published',
}

const WORK_STATUS: Record<string, Status> = {
  '커머스-리빙-리뉴얼': 'published',
  'ai-업무플랫폼-daisy': 'published',
  'o2o-예약-사용자앱': 'published',
  '핀테크-결제-어드민': 'published',
  'saas-지점정산-운영콘솔': 'pending',
  '미디어-광고-셀프집행': 'published',
  '커머스-복지몰-edk': 'draft',
  'ai-심리분석-canape': 'published',
  '플랫폼-돌봄-연결': 'rejected',
}

/* 콘텐츠의 주인.

   빌더로 로그인하면 "본인 것만" 보인다 (FR-A02-01 · FR-A04-01). 그 규칙을 확인하려면
   빌더가 소유한 콘텐츠가 실제로 있어야 한다.

   Work 은 리드 빌더(builders[0])가 주인이라 따로 적지 않는다. Insight 는 소유 개념이
   데이터에 없어서 여기서 붙인다 — 적지 않은 글은 운영팀(josh)이 주인이다. */
const INSIGHT_OWNER: Record<string, string> = {
  '3주-랜딩페이지-제작순서': 'ria',
  'ai툴-실무도입-검증기준': 'sein',
}

export const ADMIN_ACCOUNT = 'josh'

/* 빌더로 볼 때 '나'로 삼을 계정.

   ⚠ role.tsx 가 아니라 여기에 둔다. role.tsx 는 'use client' 라서, 서버 컴포넌트가 거기서
   상수를 import 하면 문자열이 아니라 클라이언트 참조 프록시가 온다 — 비교가 조용히 전부
   false 가 되고 사이드바 건수가 0 으로 나온다. 실제로 그렇게 한 번 틀렸다. */
export const BUILDER_ME = 'ria'

/* 수정일. 발행일과 다른 값이어야 "언제 마지막으로 손댔나"가 의미를 갖는다 */
const UPDATED: Record<string, string> = {
  '3주-랜딩페이지-제작순서': '2026.08.14',
  'ai툴-실무도입-검증기준': '2026.08.15',
  '기업ai-도입-거버넌스': '2026.08.12',
  'saas-지점정산-운영콘솔': '2026.08.13',
  '커머스-복지몰-edk': '2026.08.15',
  '플랫폼-돌봄-연결': '2026.08.14',
}

/* 반려 사유는 필수 입력이다 (FR-A07-04) — 반려된 건에는 반드시 값이 있다 */
export const REJECT_REASON: Record<string, string> = {
  '샘플-반려된-글': '두 번째 소제목의 주장에 근거가 없습니다. 실제로 겪은 사례나 수치를 한 줄 넣어 다시 제출해 주세요. 그리고 썸네일이 본문 내용과 맞지 않습니다.',
  '샘플-반려된-프로젝트': '커버에 고객사 로고가 그대로 남아 있습니다. 공개 동의를 확인하기 전까지는 지우거나 다른 컷으로 교체해 주세요(기획서 §14 Q7). 요약 두 번째 문장의 성과 수치도 출처가 필요합니다.',
  '기업ai-도입-거버넌스': '3장 도입부의 통계 출처가 빠졌습니다. 원 자료 링크를 달아 다시 제출해 주세요.',
  '플랫폼-돌봄-연결': '히어로 이미지에 실제 이용자 얼굴이 그대로 보입니다. 마스킹하거나 다른 컷으로 교체 후 다시 제출해 주세요.',
}

export type AdminInsight = Article & { status: Status; updated: string; owner: string }
export type AdminWork = Work & { status: Status; updated: string; leadName: string; owner: string }

/* 검수 흐름을 실제로 걸어 보기 위한 데모 글 두 건.

   ⚠ **ARTICLES 에 넣지 않는다.** 그 배열은 공개 사이트(/insight · sitemap · llms.txt)의
     원천이라, 거기 넣으면 초안·승인대기 글이 그대로 공개된다. 어드민에서만 보이는
     픽스처는 여기 따로 둔다.

   왜 필요했나 — 빌더 시점으로 보면 **편집할 수 있는 글이 하나도 없었다.** 리아가 가진 글은
   승인대기 한 건뿐이고 그건 DR-07 로 잠긴다. 잠긴 화면만 보이면 "고장났나"로 읽힌다.

     샘플-승인대기-글   관리자: 승인 · 반려를 눌러 본다  /  빌더: 잠금 안내를 본다
     샘플-작성중-글     빌더가 자유롭게 고치고 "검토 요청"까지 눌러 본다

   ⚠ ② 승인대기 건에만 **읽히는 원고**를 넣어 두었다. 나머지 넷은 지금처럼 상태를 설명하는
     안내문이다. 승인 대기 화면의 '미리보기'가 여는 것이 바로 ② 이고, 검수는 원고를 읽는
     행위이기 때문이다 — 거기서 "여기를 고쳐 보세요"가 나오면 미리보기가 고장 난 것처럼
     읽힌다. ①③④⑤ 는 편집 화면의 상태를 보여주는 자리라 안내문이 맞다.

   Supabase 가 붙으면 이 배열은 사라지고 실제 행이 그 자리를 대신한다. */

/* ② 의 원고. 검수 화면에서 실제로 읽어 보는 글이라 길이와 구조가 발행된 글과 같아야 한다
   (h2 넷 → 목차 넷). 근거 없는 수치는 넣지 않는다 (README 절대 규칙). */
const BODY_SAMPLE_PENDING = `
<p>분업을 없애면 일정이 짧아진다고들 합니다. 실제로 짧아집니다. 다만 짧아지는 이유가 흔히 말하는 것과 다릅니다 &mdash; 각자가 빨라져서가 아니라 <strong>기다리는 시간이 사라져서</strong>입니다. 3주짜리 랜딩 페이지를 빌더 한 명과 검수자 한 명 구조로 끝내면서 남긴 기록입니다.</p>

<h2 id="t1">첫째, 문서가 줄어드는 게 아니라 종류가 바뀝니다</h2>
<p>기획자가 개발자에게 넘기는 문서는 &quot;내가 이해한 것을 남에게 옮기는&quot; 문서입니다. 넘길 사람이 없으면 그 문서도 필요가 없습니다. 대신 다른 문서가 생깁니다 &mdash; <em>나중의 나</em>와 <em>검수하는 사람</em>이 읽을 결정 기록입니다.</p>
<p>우리가 남기는 것은 셋뿐입니다. 화면 목록, 각 화면에서 사용자가 하려는 일 한 줄, 그리고 &quot;이건 왜 이렇게 했나&quot;에 대한 답. 스무 장짜리 기획서가 사라진 자리에 이 셋이 남습니다.</p>
<blockquote>없어진 것은 문서가 아니라 인수인계입니다.</blockquote>

<h2 id="t2">둘째, 첫 리뷰가 시안이 아니라 화면 위에서 열립니다</h2>
<p>분업 구조에서 첫 리뷰는 대개 디자인이 끝난 뒤에 열립니다. 그때 방향이 틀린 것이 발견되면 되돌릴 수 있는 것이 거의 없습니다. 한 사람이 화면을 통째로 들고 있으면 <strong>눌러지는 화면</strong>을 먼저 올릴 수 있고, 리뷰는 그 위에서 열립니다. 말로 설명해야 했던 것의 절반이 그냥 보입니다.</p>
<p>대신 규칙이 하나 필요합니다. 만든 사람이 자기 결과물을 승인하지 못하게 하는 것입니다. 속도를 한 사람에게 몰아준 만큼 판단은 반드시 다른 사람이 합니다 &mdash; 이 글이 지금 승인 대기 상태인 이유이기도 합니다.</p>

<h2 id="t3">셋째, 남는 시간을 어디에 쓰는지가 팀의 성격이 됩니다</h2>
<p>줄어든 일정을 그대로 견적에 반영하면 그냥 싼 팀이 됩니다. 우리는 그 시간을 두 곳에 씁니다. 접근성과 성능, 그리고 인수인계 문서입니다. 둘 다 요청받은 적은 없지만, 없으면 반년 뒤에 비용으로 돌아옵니다.</p>
<p>AI 도구는 여기서 처음 등장합니다. 도구가 사람을 대신해서 빨라진 것이 아니라, 한 사람이 기획 &middot; 디자인 &middot; 개발을 오갈 때 생기는 <em>전환 비용</em>을 줄여 줍니다. 순서를 바꿔 말하면 결과도 바뀝니다.</p>

<h2 id="t4">이 방식이 맞지 않는 경우</h2>
<p>이해관계자가 많고 승인 단계가 긴 조직이라면 분업이 오히려 안전합니다. 한 사람이 전부 들고 있는 구조는 그 사람이 빠지는 순간 멈추기 때문입니다. 우리가 이 구조를 쓰는 범위도 정해져 있습니다 &mdash; 화면 스무 개 안쪽, 결정권자가 둘 이하인 프로젝트입니다.</p>

<div class="tags"><span class="tag">일하는 방식</span><span class="tag">프로덕트 빌더</span><span class="tag">협업</span></div>
`.trim()

const DEMO_INSIGHTS: AdminInsight[] = [
  {
    slug: '샘플-작성중-글', cat: 'guide',
    title: '[샘플 ①] 작성 중 — 자유롭게 수정할 수 있습니다',
    excerpt: '아직 제출하지 않은 초안입니다. 제목·본문·썸네일·주소를 모두 고칠 수 있고, 다 되면 검토를 요청합니다.',
    thumb: 'ins-turnkey.jpg', source: 'own', author: '빌더 리아', date: '2026.08.21', readMin: 2,
    bodyHtml: '<h2 id="여기를-고쳐-보세요">여기를 고쳐 보세요</h2><p>툴바로 소제목·굵게·목록·링크를 넣어 볼 수 있습니다. H1 은 없습니다 — 페이지 제목이 h1 이라 본문은 H2 부터 시작합니다.</p><h2 id="다음-단계">다음 단계</h2><p>아래 <strong>검토 요청</strong> 을 누르면 ② 상태로 넘어가고, 그때부터 작성자는 수정할 수 없습니다.</p>',
    status: 'draft', updated: '2026.08.21', owner: BUILDER_ME,
  },
  {
    slug: '샘플-승인대기-글', cat: 'how',
    title: '[샘플 ②] 분업을 없앤 3주, 실제로 달라진 세 가지',
    excerpt: '기획·디자인·개발을 한 사람이 들고 가면 일정만 짧아지는 게 아닙니다. 3주짜리 프로젝트를 그렇게 굴려 보고 남은 기록입니다.',
    thumb: 'ins-native.jpg', source: 'own', author: '빌더 리아', date: '2026.08.20', readMin: 5,
    bodyHtml: BODY_SAMPLE_PENDING,
    status: 'pending', updated: '2026.08.20', owner: BUILDER_ME,
  },
  {
    slug: '샘플-반려된-글', cat: 'how',
    title: '[샘플 ③] 반려됨 — 사유를 보고 다시 고칩니다',
    excerpt: '관리자가 사유와 함께 돌려보낸 상태입니다. 작성자는 사유를 보고 고친 뒤 다시 검토를 요청합니다.',
    thumb: 'ins-gov.jpg', source: 'own', author: '빌더 리아', date: '2026.08.19', readMin: 2,
    bodyHtml: '<h2 id="반려의-의미">반려의 의미</h2><p>거절이 아니라 되돌림입니다. 화면 맨 위에 사유가 붙어 있고, 폼은 다시 열려 있습니다.</p><h2 id="사유가-필수인-이유">사유가 필수인 이유</h2><p>사유 없는 반려는 “안 됨”만 전달합니다. 무엇을 고쳐야 하는지 없으면 다시 올라오는 것도 같은 상태입니다.</p>',
    status: 'rejected', updated: '2026.08.19', owner: BUILDER_ME,
  },
  {
    slug: '샘플-발행된-글', cat: 'project',
    title: '[샘플 ④] 발행됨 — 공개 중, 내릴 수 있습니다',
    excerpt: '승인되어 공개된 상태입니다. 작성자는 더 이상 손대지 못하고, 관리자만 수정하거나 내릴 수 있습니다.',
    thumb: 'ins-ax.jpg', source: 'own', author: '빌더 리아', date: '2026.08.18', readMin: 3,
    bodyHtml: '<h2 id="여기서부터는-관리자-몫">여기서부터는 관리자 몫</h2><p>공개 중인 글이 검수 없이 바뀌면 안 되기 때문입니다(PRD §7.3 편집 주체 = 관리자).</p><h2 id="내리면">내리면</h2><p><strong>내리기</strong> 를 누르면 ⑤ 보관 상태가 되고, 그 주소는 404 가 아니라 목록으로 301 됩니다 — 색인과 공유 링크를 버리지 않습니다.</p>',
    status: 'published', updated: '2026.08.18', owner: BUILDER_ME,
  },
  {
    slug: '샘플-보관된-글', cat: 'project',
    title: '[샘플 ⑤] 보관됨 — 내려간 글, 다시 공개할 수 있습니다',
    excerpt: '공개에서 내려간 상태입니다. 지운 것이 아니라 보관입니다 — 관리자가 다시 공개할 수 있습니다.',
    thumb: 'ins-toss.jpg', source: 'own', author: '빌더 리아', date: '2026.08.17', readMin: 2,
    bodyHtml: '<h2 id="지우지-않는-이유">지우지 않는 이유</h2><p>지우면 작성자 연결과 이력이 함께 사라집니다. 상태를 삭제 플래그로 겸하지 않는 것도 같은 이유입니다.</p><h2 id="주소는-살아-있다">주소는 살아 있다</h2><p>보관된 글의 주소는 목록으로 301 됩니다(DR-08).</p>',
    status: 'archived', updated: '2026.08.17', owner: BUILDER_ME,
  },
]

/** 데모 글을 포함한 어드민 목록. 공개 화면은 절대 이 함수를 부르지 않는다 */
export function adminInsights(): AdminInsight[] {
  return [
    ...DEMO_INSIGHTS,
    ...ARTICLES.map(a => ({
      ...a,
      status: INSIGHT_STATUS[a.slug] ?? 'draft',
      updated: UPDATED[a.slug] ?? a.date,
      owner: INSIGHT_OWNER[a.slug] ?? ADMIN_ACCOUNT,
    })),
  ]
}

/* Work 쪽 데모 다섯 건 — DEMO_INSIGHTS 와 같은 이유, 같은 다섯 상태.

   ⚠ **WORKS 에 넣지 않는다.** 그 배열은 공개 /work · /builder · sitemap 의 원천이라,
     거기 넣으면 초안·승인대기 프로젝트가 그대로 공개된다.

   왜 필요했나 — 빌더(리아) 시점의 Work 목록에 발행 1 · 반려 1, 두 건밖에 없었다. 초안 ·
   승인대기 · 보관 필터는 눌러도 전부 0 이라 검수 흐름을 화면에서 걸어 볼 수가 없다.

   커버는 기존 이미지를 재사용한다. 데모 행을 채우려고 이미지를 새로 만들지 않는다 —
   coverAlt 에 자리표시임을 적어 둔 이유다.

   리드는 BUILDER_ME(리아)다. 리드가 곧 소유자라(adminWorks 의 owner) 빌더 시점에서
   다섯 상태가 모두 보인다. Supabase 가 붙으면 이 배열은 사라진다. */

/* ② 의 케이스 본문 — works 테이블의 body_problem · body_solution · body_result 세 컬럼과
   같은 모양이다. DEMO_INSIGHTS 의 ② 와 같은 이유로 이 한 건만 원고를 채운다: 승인 대기
   화면의 '미리보기'가 여는 화면이고, 검수는 원고를 읽는 행위다.

   ⚠ 실제 프로젝트 아홉 건에는 이 원고를 복제하지 않는다. 없는 사실을 아홉 번 주장하는
     셈이고 색인에는 중복 문서로 잡힌다 (work/[slug]/view.tsx 주석).
   ⚠ 성과 수치는 넣지 않았다 (README 절대 규칙 — 근거 없는 수치 금지). 결과 절에서 왜
     아직 수치를 적지 않는지를 그대로 쓴 이유다. */
const BODY_SAMPLE_WORK = {
  problem: `
<p>문의가 세 곳으로 들어왔습니다. 홈페이지 폼, 카카오 채널, 그리고 담당자 개인 메일입니다. 어느 채널로 들어왔느냐에 따라 첫 응답까지 반나절씩 차이가 났고, 같은 질문에 서로 다른 답이 나가는 일도 있었습니다.</p>
<p>도구가 없어서 생긴 문제가 아니었습니다. 채널마다 관리 도구가 이미 있었고, 그래서 아무도 한 곳을 보지 않았습니다. 그래서 요구사항을 기능 목록이 아니라 질문 한 줄로 먼저 정했습니다 &mdash; &quot;어디를 열면 오늘 답해야 할 것이 전부 보이는가.&quot;</p>
`.trim(),
  solution: `
<p>세 채널을 하나의 받은편지함으로 모았습니다. 연동은 각 서비스의 웹훅을 그대로 쓰고, 우리 쪽에는 문의 한 건이 한 행으로만 남습니다. 원본은 원래 있던 채널에 그대로 뒀습니다 &mdash; 통째로 옮겨 담으면 그 순간부터 두 벌을 관리해야 합니다.</p>
<p>응대 초안은 지난 답변에서 가져옵니다. 새로 지어내는 대신, 비슷한 문의에 실제로 나갔던 답변을 근거로 함께 보여 줍니다. 담당자는 초안을 고르고 고쳐서 보냅니다.</p>
<blockquote>초안을 자동으로 보내지 않는 것이 이 도구의 핵심 설계입니다. 틀린 답이 빨리 나가는 것보다 나쁜 결과는 없습니다.<cite>빌더 리아 · 리드</cite></blockquote>
<p>권한은 처음부터 두 단계로 나눴습니다. 담당자는 자기에게 배정된 문의만 열고, 관리자만 전체 목록과 배정 변경을 봅니다. 내부 도구라도 문의에는 연락처가 들어 있기 때문입니다.</p>
`.trim(),
  result: `
<p>2주간 사내 파일럿으로 돌렸습니다. 담당자 두 명이 실제 문의를 이 화면에서만 처리했고, 그동안 놓친 문의가 있는지 매일 원래 채널과 대조했습니다.</p>
<p>가장 크게 달라진 것은 속도가 아니라 <em>인수인계</em>였습니다. 담당자가 자리를 비운 날에도 다른 사람이 같은 화면에서 맥락을 읽고 이어받을 수 있었습니다. 예전에는 그 맥락이 개인 메일함에 있었습니다.</p>
<p>수치는 아직 적지 않습니다. 파일럿 기간이 짧아 평균을 말할 만큼 표본이 쌓이지 않았습니다 &mdash; 한 달치가 모이면 첫 응답까지 걸린 시간을 채널별로 정리해 이 자리에 추가합니다.</p>
`.trim(),
}

const DEMO_WORKS: Array<Work & { status: Status; updated: string }> = [
  {
    slug: '샘플-작성중-프로젝트',
    title: '[샘플 ①] 작성 중인 프로젝트 — 자유롭게 수정할 수 있습니다',
    cat: 'platform', tag: 'SaaS · Admin', year: '2026',
    summary: '아직 제출하지 않은 초안입니다. 제목 · 요약 · 분야 · 커버 · 참여 빌더를 모두 고칠 수 있고, 다 되면 검토를 요청합니다.',
    cover: 'work-aerok-admin.jpg', coverAlt: '샘플 프로젝트 자리표시 이미지',
    withPartner: false, builders: [BUILDER_ME, 'hajun'],
    status: 'draft', updated: '2026.08.21',
  },
  {
    slug: '샘플-승인대기-프로젝트',
    title: '[샘플 ②] 문의 응대를 한곳에 모은 사내 AI 어시스턴트',
    cat: 'aiax', tag: 'AI · AX', year: '2026',
    summary: '세 채널로 흩어져 들어오던 문의를 하나의 받은편지함으로 모으고, 담당자가 고쳐 쓸 응대 초안까지 붙여 주는 내부 도구.',
    cover: 'work-canape.png', coverAlt: '샘플 프로젝트 자리표시 이미지',
    withPartner: false, builders: [BUILDER_ME, 'dohyun'],
    bodyProblem: BODY_SAMPLE_WORK.problem,
    bodySolution: BODY_SAMPLE_WORK.solution,
    bodyResult: BODY_SAMPLE_WORK.result,
    status: 'pending', updated: '2026.08.20',
  },
  {
    slug: '샘플-반려된-프로젝트',
    title: '[샘플 ③] 반려된 프로젝트 — 사유를 보고 다시 고칩니다',
    cat: 'commerce', tag: 'Commerce', year: '2026',
    summary: '관리자가 사유와 함께 돌려보낸 상태입니다. 화면 맨 위에 사유가 붙고, 폼은 다시 열려 있습니다.',
    cover: 'work-markspon.png', coverAlt: '샘플 프로젝트 자리표시 이미지',
    withPartner: true, builders: [BUILDER_ME, 'taeo'],
    status: 'rejected', updated: '2026.08.19',
  },
  {
    slug: '샘플-발행된-프로젝트',
    title: '[샘플 ④] 발행된 프로젝트 — 공개 중, 내릴 수 있습니다',
    cat: 'finance', tag: 'Finance', year: '2025',
    summary: '승인되어 공개된 상태입니다. 작성자는 더 이상 손대지 못하고, 관리자만 수정하거나 내릴 수 있습니다.',
    cover: 'work-nice.png', coverAlt: '샘플 프로젝트 자리표시 이미지',
    withPartner: true, builders: [BUILDER_ME, 'sein'],
    status: 'published', updated: '2026.08.18',
  },
  {
    slug: '샘플-보관된-프로젝트',
    title: '[샘플 ⑤] 보관된 프로젝트 — 다시 공개할 수 있습니다',
    cat: 'commerce', tag: 'Media', year: '2024',
    summary: '공개에서 내려간 상태입니다. 지운 것이 아니라 보관입니다 — 관리자가 다시 공개할 수 있고, 주소는 목록으로 301 됩니다.',
    cover: 'work-btv.png', coverAlt: '샘플 프로젝트 자리표시 이미지',
    withPartner: false, builders: [BUILDER_ME, 'eunchae'],
    status: 'archived', updated: '2026.08.17',
  },
]

export function adminWorks(): AdminWork[] {
  /* 리드 이름 · 소유자를 붙이는 규칙은 데모와 실데이터가 같아야 한다.
     따로 적어 두면 데모만 '—' 로 나오는 식으로 갈라진다 */
  const withLead = (w: Work, status: Status, updated: string): AdminWork => {
    const leadSlug = w.builders[0]
    const lead = leadSlug ? builderBySlug(leadSlug) : undefined
    return { ...w, status, updated, leadName: lead?.name ?? '—', owner: leadSlug ?? ADMIN_ACCOUNT }
  }

  return [
    ...DEMO_WORKS.map(({ status, updated, ...w }) => withLead(w, status, updated)),
    ...WORKS.map(w => withLead(w, WORK_STATUS[w.slug] ?? 'draft', UPDATED[w.slug] ?? `${w.year}.12.01`)),
  ]
}

export function countBy<T extends { status: Status }>(rows: T[], s: Status | 'all'): number {
  return s === 'all' ? rows.length : rows.filter(r => r.status === s).length
}

/* 승인 대기 큐 — Work·Insight 를 한 목록에 담는다 (FR-A07-01) */
export type Pending = {
  kind: 'Work' | 'Insight'
  slug: string
  title: string
  author: string
  thumb: string
  submitted: string
  href: string
}

export function pendingQueue(): Pending[] {
  /* href 는 공개 상세가 아니라 /preview 다 — 승인 전 글은 공개 라우트에 없어서 404 가 난다.
     이유는 _queries.listPending 주석에 함께 적어 뒀다. */
  const ins = adminInsights().filter(a => a.status === 'pending').map(a => ({
    kind: 'Insight' as const, slug: a.slug, title: a.title, author: a.author,
    thumb: `/assets/img/ins/${a.thumb}`, submitted: a.updated, href: `/preview/insight/${a.slug}`,
  }))
  const wk = adminWorks().filter(w => w.status === 'pending').map(w => ({
    kind: 'Work' as const, slug: w.slug, title: w.title, author: w.leadName,
    thumb: `/assets/img/${w.cover}`, submitted: w.updated, href: `/preview/work/${w.slug}`,
  }))
  return [...ins, ...wk].sort((a, b) => a.submitted.localeCompare(b.submitted))
}

/* 빌더 계정. email·최근 로그인은 2단계에서 builders 테이블 컬럼이 된다.
   ⚠ 이메일은 실제 주소가 아니라 example.com 자리표시자다 — 실주소를 목업에 넣지 않는다. */
export function adminBuilders() {
  return BUILDERS.map((b, i) => ({
    ...b,
    email: `${b.slug}@example.com`,
    accountRole: i === 0 ? ('admin' as const) : ('builder' as const),
    active: b.slug !== 'junho',
    lastLogin: b.slug === 'junho' ? '—' : ['2026.08.16', '2026.08.15', '2026.08.11', '2026.07.29'][i % 4]!,
  }))
}

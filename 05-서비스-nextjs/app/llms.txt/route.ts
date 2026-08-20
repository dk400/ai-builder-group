import { SITE, SITE_URL, DEFAULT_DESC } from '../_meta'
import { WORKS } from '../_works'
import { ARTICLES, CATEGORY_LABEL } from '../_insights'

/* llms.txt — SR-03

   robots.txt 가 크롤러에게 "어디를 봐도 되는지"를 알려준다면, llms.txt 는 답변형 검색·
   AI 어시스턴트에게 "이 사이트가 무엇이고 어느 주소에 무엇이 있는지"를 한 장으로 알려준다.
   HTML 을 긁어 추측하는 대신 이 파일을 읽게 만드는 것이 목적이라, 링크 목록이 실제 라우트와
   어긋나면 없느니만 못하다. → 목록은 sitemap 과 같은 데이터(WORKS · ARTICLES)에서 뽑는다.

   ⚠ SR-09: GEO·AEO 별도 대응은 범위 밖이다. 이 파일은 "요구된 산출물 한 개"지
      AI 검색 최적화 작업의 시작점이 아니다. 늘리지 않는다.

   제외 대상은 sitemap 과 같다 — /admin/* · /submit · /image-guide. */

export const dynamic = 'force-static'

const abs = (path: string) => new URL(path, SITE_URL).toString()

export function GET(): Response {
  const lines: string[] = [
    `# ${SITE}`,
    '',
    `> ${DEFAULT_DESC}`,
    '',
    'AI 빌더 스쿨을 통과한 빌더들이 기획 · 개발 · 검수까지 맡는 바이브 코딩 외주 팀입니다.',
    '문의는 사이트에서 받지 않고 외부 폼(pluug)으로 연결됩니다.',
    '',
    '## 주요 페이지',
    '',
    `- [홈](${abs('/')}): 일하는 방식과 대표 작업물`,
    `- [Work](${abs('/work')}): 실제 수행한 프로젝트 목록`,
    `- [Insight](${abs('/insight')}): 발주 가이드 · 일하는 방식 아티클`,
    `- [콘텐츠](${abs('/content')}): 유튜브 영상 모음`,
    `- [빌더](${abs('/builder')}): 참여 빌더 소개`,
    `- [FAQ](${abs('/faq')}): 문의 전 자주 묻는 질문`,
    `- [문의하기](${abs('/contact')}): 프로젝트 문의`,
    '',
    '## Work',
    '',
    ...WORKS.map(w => `- [${w.title}](${abs(`/work/${w.slug}`)}): ${w.summary}`),
    '',
    '## Insight',
    '',
    ...ARTICLES.map(a => `- [${a.title}](${abs(`/insight/${a.slug}`)}): ${CATEGORY_LABEL[a.cat]} — ${a.excerpt}`),
    '',
    '## 다루지 않는 것',
    '',
    '- 관리자 화면(/admin)과 문의 접수 완료 화면(/submit)은 색인 대상이 아닙니다.',
    '- 사이트에서 문의 데이터를 직접 저장하지 않습니다.',
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  })
}

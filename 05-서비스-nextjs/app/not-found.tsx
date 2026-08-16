import Link from 'next/link'
import type { Metadata } from 'next'

/* FR-C-09 — 없는 주소는 200 이 아니라 404 로 응답하고, 홈·문의 경로를 제시한다.
   슬러그 라우트가 생기면서 오타 하나로 도달할 수 있는 주소가 스무 개 늘었다.
   Next 기본 404 는 영문 한 줄이라 여기서 사이트 톤으로 받는다.

   제목을 h1 으로 두는 이유 — 페이지마다 h1 이 정확히 하나여야 한다는 규칙을 404 도 지킨다.
   .empty 카드 안에 넣으면 h3 크기를 따라가므로 페이지 헤드 구조를 그대로 쓴다. */
export const metadata: Metadata = {
  title: '페이지를 찾을 수 없습니다 — AI 빌더 그룹',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <main id="main">
      <div className="page-head">
        <div className="wrap">
          <h1><span className="w300">찾으시는 페이지가</span> 없습니다</h1>
          <p>주소가 바뀌었거나, 아직 공개되지 않은 페이지일 수 있습니다.</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          {/* .btn--ghost 는 잉크색 글자 + 옅은 테두리라 어두운 cta-banner 안에서는 보이지 않는다.
              배너에는 라임 버튼 하나만 두고, 나머지 경로는 밝은 배경에 깐다. */}
          <div className="cta-banner">
            <div>
              <h3>어디로 가시겠어요?</h3>
              <p>찾으시던 것이 프로젝트였다면, 이야기를 들려주세요.</p>
            </div>
            <Link className="btn btn--lime" href="/contact">프로젝트 문의 <span className="arr">→</span></Link>
          </div>
          <div style={{ marginTop: 30, textAlign: 'center', display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="btn btn--ghost btn--sm" href="/">홈으로</Link>
            <Link className="btn btn--ghost btn--sm" href="/work">작업물 보기</Link>
            <Link className="btn btn--ghost btn--sm" href="/insight">인사이트 보기</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

'use client'

import Link from 'next/link'
import FaqList from '@/components/FaqList'
import { FAQ } from '@/app/_faq'
import { useDock } from '@/components/fx'

export default function FaqView() {
  useDock('sub')

  return (
    <>
      <main id="main">
        <div className="page-head">
          <div className="wrap">
            <h1><span className="w300">자주 묻는</span> 질문</h1>
            <p>문의 전에 가장 많이 받는 질문을 모았습니다. 여기서 답을 못 찾으셨다면 바로 물어봐 주세요.</p>
          </div>
        </div>

        <section className="faqpage">
          <div className="wrap">
            {/* 데이터는 app/_faq.ts 한 곳에서 온다 — 홈 프리뷰와 같은 원본 */}
            <FaqList topics={FAQ} />

            <div className="faq-cta">
              <div>
                <b>찾으시는 답이 없나요?</b>
                <span>프로젝트 내용을 남겨 주시면 24시간 안에 회신드립니다.</span>
              </div>
              <Link className="btn btn--ink" href="/contact" data-track="cta_click" data-location="faq_bottom">
                프로젝트 문의 <span className="arr">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 플로팅 CTA 독 */}
      <div className="dock" data-dock>
        <div className="dock__txt"><b>검증된 바이브 코딩</b><span>무료 문의 — 부담 없이 남겨보세요</span></div>
        <Link className="btn btn--lime btn--sm" href="/contact" data-track="cta_click" data-location="floating">프로젝트 문의 <span className="arr">→</span></Link>
        <button className="dock__x" aria-label="닫기" data-dock-x>✕</button>
      </div>
      <button className="dock-open" data-dock-open aria-label="문의 바 다시 열기">💬</button>
    </>
  )
}

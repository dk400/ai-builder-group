'use client'

import { useState } from 'react'
import type { FaqTopic } from '@/app/_faq'

/* 주제 탭 + 아코디언. 홈 프리뷰(S9)와 /faq 가 같은 컴포넌트를 쓴다.
   전에는 홈에만 마크업이 있고 열림 상태를 전역 DOM 이벤트로 다뤘는데,
   페이지가 둘이 되는 순간 같은 스크립트가 두 벌 돌게 된다. 상태를 컴포넌트 안에 둔다. */
export default function FaqList({ topics, defaultOpen }: { topics: FaqTopic[]; defaultOpen?: string }) {
  const [topic, setTopic] = useState(topics[0]?.key ?? '')
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null)
  const current = topics.find(t => t.key === topic) ?? topics[0]

  return (
    <>
      {topics.length > 1 && (
        <div className="topics" role="tablist" aria-label="FAQ 주제">
          {topics.map(t => (
            <button
              key={t.key}
              className="topic"
              role="tab"
              type="button"
              aria-selected={t.key === topic}
              data-topic={t.key}
              data-track="faq_topic_change"
              onClick={() => setTopic(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div>
        {current?.items.map(it => (
          <div className="faq-item" key={it.id}>
            <button
              className="faq-q"
              type="button"
              aria-expanded={open === it.id}
              aria-controls={it.id}
              onClick={() => setOpen(v => (v === it.id ? null : it.id))}
            >
              {it.q}
            </button>
            {/* 안쪽 래퍼가 꼭 필요하다. 0fr 트랙은 그리드 아이템의 '자동 최소 크기'까지만
                줄이는데, p 에 padding 이 있으면 min-height:0 으로도 그 패딩만큼(28px)이
                남아 접었을 때 한 줄이 새어 나온다. 패딩 없는 래퍼를 아이템으로 둔다. */}
            <div className="faq-a" id={it.id} role="region">
              <div className="faq-a__in"><p>{it.a}</p></div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

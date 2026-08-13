'use client'

import Link from 'next/link'
import { useEffect, type CSSProperties } from 'react'
import { useRibbonFlow, useDock } from '@/components/fx'

const durStyle: CSSProperties = {
  position: 'absolute', top: 14, right: 14, zIndex: 3, fontFamily: 'var(--mono)', fontSize: 11,
  letterSpacing: '.1em', background: 'rgba(0,0,0,.55)', color: 'rgba(244,241,234,.85)',
  padding: '5px 10px', borderRadius: 999,
}

type Video = { yt: string; ch: string; dur: string; title: string; sub: string }
const VIDEOS: Video[] = [
  { yt: 'kkbtjKvnS-Q', ch: '김이솝의 AI 가이드', dur: '11:11', title: '미친 무료기능 총집합! 제미나이 10분만에 마스터', sub: '조회 44만' },
  { yt: 'ZIn53VIic14', ch: '김이솝의 AI 가이드', dur: '7:57', title: 'AI 동물 인터뷰 쇼츠 만들기 7분만에 끝!', sub: '조회 36만' },
  { yt: '8uif-Wf65SI', ch: '김이솝의 AI 가이드', dur: '18:38', title: '12시간씩 클로드 코드 쓰고 깨달은 핵심 꿀팁 20가지', sub: '조회 5.1천 · NEW' },
  { yt: 'TP6ArUCnt8c', ch: '똑똑한개발자', dur: '15:47', title: '잘봐 이게 컨퍼런스다 — 똑똑한개발자 × 원티드', sub: '브이로그' },
  { yt: 'LjrO4urq5gI', ch: 'AI 서대표', dur: '23:40', title: '10년차 IT 에이전시 대표가 푸는 개발 외주의 모든 것', sub: '예산·견적·계약' },
  { yt: 'gtZPILhrnl8', ch: 'AI 서대표', dur: '13:48', title: '오르카(Orca) 설치부터 AI 블로그 자동화 세팅까지', sub: 'NEW' },
]

export default function ContentView() {
  /* 다크 지면 페이지 — body.dark */
  useEffect(() => {
    document.body.classList.add('dark')
    return () => document.body.classList.remove('dark')
  }, [])

  useRibbonFlow({
    rsC: [
      'YOUTUBE ✳ 김이솝의 AI 가이드 ✳ 똑똑한개발자 ✳ AI 서대표 ✳ ',
      'NEW VIDEO EVERY WEEK ✳ 실전 바이브 코딩 ✳ ',
      '8.4만 크리에이터 ✳ WATCH, THEN BUILD ✳ ',
      '보는 것에서 만드는 것으로 ✳ AI BUILDER GROUP ✳ ',
    ],
  }, { rsC: 5000 })
  useDock('sub')

  /* 유튜브 직행 + UTM (목업: 이동 대신 UTM 표시 + 콘솔 기록) */
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[data-yt]').forEach(v => {
      v.addEventListener('click', e => {
        e.preventDefault()
        const utm = '?utm_source=builder-group&utm_medium=content&utm_content=' + v.dataset.utm
        window.track?.('youtube_outbound', { utm })
      })
    })
  }, [])

  return (
    <>
      <main id="main" className="grain">
        <div className="page-head">
          <div className="wrap">
            <h1><span className="w300">영상으로 보는</span><br />우리의 작업</h1>
            <p>김이솝의 AI 가이드 · 똑똑한개발자 · AI 서대표 — 세 채널의 실전 콘텐츠</p>
          </div>
        </div>

        {/* v19: 이음새 리본 — 페이지 헤드 ↔ 영상 그리드 (다크 위 라임) */}
        <div className="ribbon-sep" aria-hidden="true">
          <svg viewBox="0 0 1600 200" preserveAspectRatio="xMidYMid slice">
            <path id="rsC" d="M -80,110 C 300,70 560,140 880,100 C 1200,60 1400,130 1700,95" fill="none" />
            <use href="#rsC" className="edge" />
            <use href="#rsC" className="lane" />
            <text dy="6">
              <textPath href="#rsC" data-wflow data-unit="4" data-speed="0.02">YOUTUBE ✳ 김이솝의 AI 가이드 ✳ 똑똑한개발자 ✳ AI 서대표 ✳ YOUTUBE ✳ 김이솝의 AI 가이드 ✳ 똑똑한개발자 ✳ AI 서대표 ✳ </textPath>
            </text>
          </svg>
        </div>

        <section>
          <div className="wrap">
            {/* 피처드 (관리자 지정 1건) */}
            <a className="vcell feat" href="#" data-yt data-utm="featured">
              <img className="vimg" src="https://i.ytimg.com/vi/0dBSo3eDE-E/hqdefault.jpg" alt="" />
              <div className="vshade"></div>
              <span className="chbadge">똑똑한개발자</span>
              <span className="dur" style={durStyle}>15:47</span>
              <div className="play"><i>▶</i></div>
              <div className="cap"><b>2025 똑똑한개발자 상반기 워크샵</b><span>오피셜 · Featured</span></div>
            </a>

            <div className="vg">
              {VIDEOS.map(v => (
                <a className="vcell" href="#" data-yt data-utm="grid" key={v.yt}>
                  <img className="vimg" src={`https://i.ytimg.com/vi/${v.yt}/hqdefault.jpg`} alt="" />
                  <div className="vshade"></div>
                  <span className="chbadge">{v.ch}</span>
                  <span className="dur" style={durStyle}>{v.dur}</span>
                  <div className="play"><i>▶</i></div>
                  <div className="cap"><b>{v.title}</b><span>{v.sub}</span></div>
                </a>
              ))}
            </div>

            <div className="sub-banner">
              <div>
                <h3>채널을 구독하면 새 영상을 놓치지 않아요</h3>
                <p>매주 실전 바이브 코딩 콘텐츠가 올라옵니다.</p>
              </div>
              <a className="btn btn--lime" href="#" data-yt data-utm="subscribe">유튜브 채널 가기 <span className="arr">→</span></a>
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

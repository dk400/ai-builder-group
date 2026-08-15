import { ImageResponse } from 'next/og'

/* 공유 미리보기 카드. 기존 og-image.png 는 히어로 스크린샷이라 썸네일 크기에서 글씨가
   읽히지 않았고, 동의를 받지 않은 시연용 샘플 화면(카카오뱅크 · 토스 · 29CM …)이 공유될
   때마다 함께 나갔다. 로고 마크 중심의 카드로 바꾼다.

   글자는 로마자만 쓴다. ImageResponse 의 기본 폰트에는 한글 글리프가 없어서 한글을 넣으면
   두부(□)로 렌더된다. 한글을 넣으려면 폰트 파일을 저장소에 넣고 매번 로드해야 하는데,
   그만한 이득이 없다 — 메신저는 og:title · og:description 의 한글을 카드 아래 텍스트로
   따로 보여주고, 이미지가 맡을 몫은 '누구인지 한눈에 알아보게 하는 것'이다.
   여기 쓴 문구는 사이트 리본에 이미 나오는 것들이다. */

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'AI 빌더 그룹 — 바이브 코딩 외주'

const INK = '#0E0E0C'
const LIME = '#D8FF3D'
const PAPER = '#F4F1EA'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: PAPER,
          backgroundImage: `radial-gradient(60% 70% at 88% 6%, ${LIME}44, transparent 60%)`,
          padding: '78px 84px 0',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* GNB 로고 마크 — favicon(app/icon.svg)과 같은 도형 */}
          <svg width="132" height="132" viewBox="0 0 64 64">
            <g transform="rotate(-8 32 32)">
              <rect x="4" y="4" width="56" height="56" rx="18.7" fill={INK} />
              <g stroke={LIME} strokeWidth="5.4" strokeLinecap="round">
                <path d="M32 15.5V48.5" />
                <path d="M15.5 32H48.5" />
                <path d="M20.3 20.3L43.7 43.7" />
                <path d="M43.7 20.3L20.3 43.7" />
              </g>
            </g>
          </svg>

          <div
            style={{
              display: 'flex',
              marginTop: 44,
              fontSize: 86,
              fontWeight: 800,
              letterSpacing: '-0.035em',
              color: INK,
              lineHeight: 1,
            }}
          >
            AI BUILDER GROUP
          </div>

          {/* 브랜드의 시그니처 — 라임 블록 위 잉크 글자 */}
          <div style={{ display: 'flex', marginTop: 30, alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                background: LIME,
                color: INK,
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                padding: '10px 20px',
                borderRadius: 12,
              }}
            >
              WE BUILD THE REST
            </div>
            <div style={{ display: 'flex', marginLeft: 22, fontSize: 30, color: '#6B6A61' }}>
              Vibe coding agency
            </div>
          </div>
        </div>

        {/* 하단 리본 — 사이트의 이음새 리본과 같은 어휘 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 26,
            background: INK,
            color: LIME,
            height: 96,
            margin: '0 -84px',
            fontSize: 27,
            fontWeight: 700,
            letterSpacing: '0.16em',
          }}
        >
          <span>PLAN</span><span>·</span>
          <span>DESIGN</span><span>·</span>
          <span>BUILD</span><span>·</span>
          <span>REVIEW</span><span>·</span>
          <span>REAL PROJECTS ONLY</span>
        </div>
      </div>
    ),
    size,
  )
}

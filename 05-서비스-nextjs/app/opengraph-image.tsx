import { ImageResponse } from 'next/og'

/* 공유 미리보기 카드.
   기존 og-image.png 는 히어로 스크린샷이라 ① 썸네일 크기에서 글씨가 안 읽히고
   ② 동의를 받지 않은 시연용 샘플 화면(카카오뱅크 · 토스 · 29CM …)이 공유될 때마다
   함께 나갔다. 로고 마크 + 브랜드 문구 카드로 바꾼다. */

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'AI 빌더 그룹 — 바이브 코딩 외주'

const INK = '#0E0E0C'
const LIME = '#D8FF3D'
const PAPER = '#F4F1EA'
const MUTED = '#6B6A61'

/* 카드에 그릴 문구. 아래 SUBSET 이 이 값들에서 글자셋을 역산하므로
   카피를 고쳐도 폰트 서브셋이 따라온다 — 글자가 두부(□)로 빠질 일이 없다. */
const T = {
  brand: 'AI빌더그룹',
  h1a: '바이브 코딩으로,',
  h1mark: '외주',
  h1b: '를 해드립니다',
  sub: '기획부터 개발, 검수까지 한 팀이 끝까지 맡습니다',
  ribbon: '기획 · 디자인 · 개발 · 검수 · 실제 서비스 URL 공개',
}
const SUBSET = Array.from(new Set(Object.values(T).join(''))).join('')

/* ImageResponse 기본 폰트에는 한글 글리프가 없다. Google Fonts 의 text= 서브셋으로
   실제 쓰는 글자만 받아온다 (전체 6MB → 8KB 내외).
   satori 는 woff2 를 못 읽으므로 구형 User-Agent 로 요청해 ttf 를 받는다. */
async function loadKoFont(weight: 400 | 800): Promise<ArrayBuffer> {
  const api = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@${weight}&text=${encodeURIComponent(SUBSET)}`
  const css = await fetch(api, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64)' },
  }).then(r => r.text())
  const src = css.match(/src:\s*url\((https:[^)]+)\)\s*format\('truetype'\)/)?.[1]
  if (!src) throw new Error('ttf src not found in Google Fonts response')
  return fetch(src).then(r => r.arrayBuffer())
}

function Mark({ px }: { px: number }) {
  /* favicon(app/icon.svg) · GNB 로고와 같은 도형 */
  return (
    <svg width={px} height={px} viewBox="0 0 64 64">
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
  )
}

export default async function OpengraphImage() {
  /* 폰트를 못 받아도 빌드가 죽으면 안 된다 — 그때는 로마자 카드로 떨어진다 */
  let fonts
  try {
    const [regular, bold] = await Promise.all([loadKoFont(400), loadKoFont(800)])
    fonts = [
      { name: 'NotoKR', data: regular, weight: 400 as const, style: 'normal' as const },
      { name: 'NotoKR', data: bold, weight: 800 as const, style: 'normal' as const },
    ]
  } catch {
    fonts = undefined
  }
  const ko = Boolean(fonts)
  const font = ko ? { fontFamily: 'NotoKR' } : {}

  return new ImageResponse(
    (
      <div
        style={{
          ...font,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: PAPER,
          backgroundImage: `radial-gradient(60% 70% at 88% 6%, ${LIME}44, transparent 60%)`,
          padding: '66px 78px 0',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Mark px={92} />
            <div
              style={{
                display: 'flex',
                marginLeft: 22,
                fontSize: 44,
                fontWeight: 800,
                letterSpacing: '-0.04em',
                color: INK,
              }}
            >
              {ko ? T.brand : 'AI BUILDER GROUP'}
            </div>
          </div>

          {ko ? (
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 40 }}>
              <div style={{ display: 'flex', fontSize: 74, fontWeight: 800, letterSpacing: '-0.045em', color: INK }}>
                {T.h1a}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}>
                {/* 히어로 h1 과 같은 라임 블록 — 브랜드의 시그니처 */}
                <div
                  style={{
                    display: 'flex',
                    background: LIME,
                    color: INK,
                    fontSize: 74,
                    fontWeight: 800,
                    letterSpacing: '-0.045em',
                    padding: '2px 16px 10px',
                    borderRadius: 14,
                  }}
                >
                  {T.h1mark}
                </div>
                <div style={{ display: 'flex', fontSize: 74, fontWeight: 800, letterSpacing: '-0.045em', color: INK }}>
                  {T.h1b}
                </div>
              </div>
              <div style={{ display: 'flex', marginTop: 26, fontSize: 30, fontWeight: 400, color: MUTED }}>
                {T.sub}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 54 }}>
              <div
                style={{
                  display: 'flex',
                  background: LIME,
                  color: INK,
                  fontSize: 44,
                  fontWeight: 800,
                  padding: '12px 24px',
                  borderRadius: 14,
                }}
              >
                WE BUILD THE REST
              </div>
              <div style={{ display: 'flex', marginLeft: 24, fontSize: 34, color: MUTED }}>Vibe coding agency</div>
            </div>
          )}
        </div>

        {/* 하단 리본 — 사이트의 이음새 리본과 같은 어휘 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: INK,
            color: LIME,
            height: 92,
            margin: '0 -78px',
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: '0.06em',
          }}
        >
          {ko ? T.ribbon : 'PLAN · DESIGN · BUILD · REVIEW · REAL PROJECTS ONLY'}
        </div>
      </div>
    ),
    { ...size, ...(fonts ? { fonts } : {}) },
  )
}

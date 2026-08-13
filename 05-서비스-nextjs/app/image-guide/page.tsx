import type { Metadata } from 'next'
import Link from 'next/link'
import './image-guide.css'

export const metadata: Metadata = {
  title: '이미지 에셋 가이드 — AI 빌더 그룹',
}

const TH = (
  <thead><tr><th>위치</th><th>슬롯</th><th>수량</th><th>내용</th><th>권장 사이즈 (@2x)</th><th>우선순위</th></tr></thead>
)

export default function ImageGuidePage() {
  return (
    <main id="main">
      <div className="ig-head"><div className="wrap">
        <h1>이미지 에셋 가이드 — <mark>어디에, 무엇을, 몇 픽셀로</mark></h1>
        <p>레퍼런스-가이드 진단 03(&quot;플레이스홀더 이미지 = AI 신호&quot;)의 해결 문서입니다.
          목업의 모든 이미지 자리는 <b>슬롯</b>으로 만들어져 있고, 각 화면 우하단의 <b>ASSET GUIDE</b> 버튼을 켜면
          슬롯 위에 스펙(용도·권장 사이즈)이 오버레이로 표시됩니다. 이 표는 그 슬롯들의 전체 목록입니다.</p>
        <div className="howto">
          <div className="h"><b>Step 1 — 확인</b>각 페이지에서 ASSET GUIDE 토글을 켜고 슬롯 위치·스펙을 확인합니다.</div>
          <div className="h"><b>Step 2 — 수집</b>아래 표의 우선순위(P1부터)대로 실물 에셋을 수집·촬영·캡처합니다.</div>
          <div className="h"><b>Step 3 — 교체</b>슬롯의 CSS 조판을 <code>{'<img>'}</code>로 교체합니다. 사이즈는 @2x 기준입니다.</div>
        </div>
      </div></div>

      <section className="blk"><div className="wrap">
        <div className="eyebrow"><i></i>P-01 홈 <span className="no">— 슬롯 14개</span></div>
        <h2>홈 (index)</h2>
        <div className="tblw" style={{ marginTop: 26 }}><table>
          {TH}
          <tbody>
            <tr><td className="m">S1 히어로</td><td><b>실물 카루셀 카드</b></td><td className="m">6</td><td>실제 프로젝트 스크린샷 — 브라우저 프레임 크롭. 프로젝트마다 다른 화면(메인/관리자/모바일)으로 다양성 확보</td><td className="m">944×600 · 16:10</td><td><span className="p p--must">P1 필수</span></td></tr>
            <tr><td className="m">S4 검증</td><td><b>고객사 로고월</b></td><td className="m">6+</td><td>고객사 로고 — 흑백 1색 SVG 통일. <b>사용 동의 수령 후 게재(C5)</b>. 동의 전엔 섹션 숨김</td><td className="m">SVG (h48 기준)</td><td><span className="p">P2</span></td></tr>
            <tr><td className="m">S5 매칭 카드</td><td><b>작업 장면 사진</b></td><td className="m">3</td><td>① 랜딩 작업 화면 ② 화이트보드 설계 논의 ③ 코드/프롬프트 클로즈업 — 전부 어두운 톤 보정으로 통일</td><td className="m">800×1000 · 4:5</td><td><span className="p p--must">P1 필수</span></td></tr>
            <tr><td className="m">S6 Work 프리뷰</td><td><b>프로젝트 커버</b></td><td className="m">3</td><td>실서비스 대표 화면. 목록 페이지(P-02)와 동일 에셋 재사용</td><td className="m">1520×1045 · 16:11</td><td><span className="p p--must">P1 필수</span></td></tr>
            <tr><td className="m">S8 유튜브</td><td><b>영상 썸네일</b></td><td className="m">3</td><td>유튜브 원본 썸네일 그대로 (yt 썸네일 API로 자동 수급 가능)</td><td className="m">1280×720 · 16:9</td><td><span className="p">P2 자동</span></td></tr>
          </tbody>
        </table></div>
      </div></section>

      <section className="blk"><div className="wrap">
        <div className="eyebrow"><i></i>P-02 · P-03 <span className="no">— 슬롯 13개</span></div>
        <h2>Work 목록 · 상세</h2>
        <div className="tblw" style={{ marginTop: 26 }}><table>
          {TH}
          <tbody>
            <tr><td className="m">P-02 목록</td><td><b>커버 (대형 8col)</b></td><td className="m">2</td><td>주력 프로젝트 — 메인 화면 와이드 캡처</td><td className="m">1600×1000 · 16:10</td><td><span className="p p--must">P1 필수</span></td></tr>
            <tr><td className="m">P-02 목록</td><td><b>커버 (세로 4col)</b></td><td className="m">2</td><td>모바일 화면 or 세로 크롭 — 그리드 리듬용. 모바일 3장 콜라주도 가능</td><td className="m">800×1000 · 4:5</td><td><span className="p p--must">P1 필수</span></td></tr>
            <tr><td className="m">P-02 목록</td><td><b>커버 (중형 6col)</b></td><td className="m">2</td><td>일반 캡처</td><td className="m">1520×1045 · 16:11</td><td><span className="p">P2</span></td></tr>
            <tr><td className="m">P-03 상세 히어로</td><td><b>케이스 대표컷</b></td><td className="m">1/건</td><td>프로젝트당 최고 퀄리티 1장 — 상세 페이지의 첫인상</td><td className="m">2100×1000 · 21:10</td><td><span className="p p--must">P1 필수</span></td></tr>
            <tr><td className="m">P-03 본문</td><td><b>과정 스크린샷</b></td><td className="m">3/건</td><td>①핵심 플로우(16:9) ②③세로 페어(4:5×2 — 콘솔·지표 등). 개인정보 마스킹 필수. FIG 캡션 함께</td><td className="m">1440×810 + 800×1000×2</td><td><span className="p">P2</span></td></tr>
            <tr><td className="m">P-03 하단</td><td><b>다음 프로젝트 썸네일</b></td><td className="m">1/건</td><td>P-02 커버 재사용</td><td className="m">1520×950</td><td><span className="p">P3 재사용</span></td></tr>
          </tbody>
        </table></div>
      </div></section>

      <section className="blk"><div className="wrap">
        <div className="eyebrow"><i></i>P-04 ~ P-09 <span className="no">— 슬롯 10개</span></div>
        <h2>Insight · 콘텐츠 · 기타</h2>
        <div className="tblw" style={{ marginTop: 26 }}><table>
          {TH}
          <tbody>
            <tr><td className="m">P-04 목록</td><td><b>글 썸네일</b></td><td className="m">6+</td><td>글마다 밝은 톤 그래픽/사진. 없으면 텍스트 전용 카드도 허용 — 균일함 방지</td><td className="m">640×400 · 16:10</td><td><span className="p">P3</span></td></tr>
            <tr><td className="m">P-05 본문</td><td><b>커버 + 본문 이미지</b></td><td className="m">1~3/글</td><td>커버 1 + 본문 도해·캡처. 캡션 필수</td><td className="m">1440×810 · 16:9</td><td><span className="p">P3</span></td></tr>
            <tr><td className="m">P-06 콘텐츠</td><td><b>영상 썸네일</b></td><td className="m">7</td><td>유튜브 썸네일 자동 수급 (i.ytimg.com)</td><td className="m">1280×720</td><td><span className="p">P2 자동</span></td></tr>
            <tr><td className="m">P-03 사이드</td><td><b>빌더 아바타</b></td><td className="m">3+</td><td>참여 빌더 프로필 — <b>촬영 동의 후</b>. 동의 전엔 이니셜 원형 유지</td><td className="m">160×160 원형</td><td><span className="p">P3 동의 후</span></td></tr>
            <tr><td className="m">공통 OG</td><td><b>og:image</b></td><td className="m">1+</td><td>공유 미리보기 — 로고+카피. 페이지별 변형은 2차</td><td className="m">1200×630</td><td><span className="p p--must">P1 필수</span></td></tr>
            <tr><td className="m">공통</td><td><b>파비콘</b></td><td className="m">1</td><td>라임 도트 로고 단순화</td><td className="m">SVG + 180×180</td><td><span className="p p--must">P1 필수</span></td></tr>
          </tbody>
        </table></div>
      </div></section>

      <section className="blk" style={{ borderBottom: 0 }}><div className="wrap">
        <div className="eyebrow"><i></i>Rules</div>
        <h2>촬영·캡처 베스트 프랙티스</h2>
        <div className="rules" style={{ marginTop: 26 }}>
          <div className="rl ok"><h4>✓ Do</h4><ul>
            <li><b>스크린샷은 실데이터 화면으로.</b> 로렘 입숨이 보이는 캡처는 목업 신호 — 데모 계정에 실제와 유사한 데이터를 채운 뒤 캡처.</li>
            <li><b>브라우저 프레임 통일</b> — 같은 브라우저·같은 창 비율(1440px)·주소창 포함. 다크/라이트는 프로젝트 톤에 맞춰 하나로.</li>
            <li><b>사진은 한 세트로 촬영</b> — 같은 날, 같은 조명, 같은 보정 프리셋(어두운 톤 + 라임 포인트 살리기). 낱장 수급이 균일함을 깬다.</li>
            <li><b>파일명 규칙</b> — <code>w001-cover@2x.webp</code>, <code>s5-match-01@2x.webp</code> 슬롯 ID와 1:1.</li>
            <li><b>WebP + @2x</b>, 커버류는 150KB 이하로 압축. LCP 대상(S1·P-03 히어로)은 <code>fetchpriority=&quot;high&quot;</code>.</li>
            <li>모든 이미지에 <b>실질적인 alt</b> — &quot;이미지&quot;가 아니라 &quot;AI 상담 챗봇 대화 화면&quot;.</li>
          </ul></div>
          <div className="rl no"><h4>✗ Don&apos;t</h4><ul>
            <li><b>스톡 사진 금지.</b> 악수하는 손, 웃는 회의실 — 신뢰를 깎는 대표 신호. 찍을 수 없으면 스크린샷과 그래픽으로만 구성.</li>
            <li><b>AI 생성 이미지 금지.</b> &quot;AI가 아닌 듯한&quot; 사이트가 목표 — 손가락 6개짜리 이미지 하나로 무너진다.</li>
            <li>고객사 로고·담당자 실명·빌더 얼굴은 <b>동의 서면 수령 전 게재 금지</b> (C5). 받기 전엔 해당 슬롯 숨김.</li>
            <li>민감정보(고객명·전화번호·금액)가 보이는 캡처 — 반드시 마스킹 후 사용.</li>
            <li>같은 스크린샷을 여러 슬롯에 재사용 (다음 프로젝트 썸네일 제외) — 균일함 신호.</li>
          </ul></div>
        </div>
      </div></section>

      <div className="wrap" style={{ paddingBottom: 40 }}>
        <div className="ft__bottom" style={{ borderTop: 0, paddingTop: 0 }}>
          <span>ASSET GUIDE · 2026.08</span>
          <Link href="/">← 홈으로</Link>
        </div>
      </div>
    </main>
  )
}

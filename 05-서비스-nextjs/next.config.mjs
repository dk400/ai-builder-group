/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    /* 상세 페이지가 목업 시절엔 라우트 하나(/work-detail · /insight-detail)뿐이었고
       카드 열일곱 장이 전부 그리로 갔다. 이제 슬러그별 라우트가 생겼는데, 구 주소는
       이미 사이트맵에 실려 나갔으므로 404 로 버리지 않고 목록으로 넘긴다.

       1:1 로 대응하는 새 주소가 없어서 목록이 종점이다 — 구 주소가 보여주던 내용은 특정
       프로젝트가 아니라 예시였다.

       슬러그를 바꿀 일이 생기면 여기에 한 줄씩 추가한다. 어드민 5단계에서 이 규칙이
       redirects 테이블로 옮겨간다 (SR-06 — 슬러그 변경 시 301 자동 생성).

       permanent:true 는 308 을 내보낸다. 검색엔진은 308 도 영구 이동으로 읽지만, 기획서가
       요구한 코드는 301 이고 GET 문서 이동의 관례도 301 이라 statusCode 로 직접 지정한다. */
    return [
      { source: '/work-detail', destination: '/work', statusCode: 301 },
      { source: '/insight-detail', destination: '/insight', statusCode: 301 },
    ]
  },
}

export default nextConfig

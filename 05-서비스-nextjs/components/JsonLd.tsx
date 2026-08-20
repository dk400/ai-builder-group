/* JSON-LD 를 <script> 로 심는다.

   Next 의 metadata API 는 구조화 데이터를 다루지 않으므로 마크업에 직접 넣어야 한다.
   서버 컴포넌트라 HTML 에 그대로 실려 나가고, 자바스크립트가 꺼져 있어도 크롤러가 읽는다.

   `<` 를 이스케이프하는 이유: 데이터에 `</script>` 문자열이 들어오면 태그가 거기서 닫히고
   그 뒤가 마크업으로 해석된다. 지금은 데이터가 전부 우리 파일이지만, 어드민이 붙으면
   이 값들은 사용자 입력이 된다. */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\u003c') }}
    />
  )
}

import Link from 'next/link'
import { STATUS_LABEL, type Status } from '../admin/_transitions'

/* 승인 전 미리보기 띠.

   왜 필요한가 — 이 화면은 공개 상세와 **픽셀 단위로 같은 렌더**다(FR-A07-02). 같아야 검수가
   되는데, 같기 때문에 새 탭에서 열면 "이미 공개된 화면" 으로 읽힌다. 실제로 공개된 것과
   승인을 기다리는 것을 눈으로 구분할 표시가 하나는 있어야 한다.

   왜 아래쪽인가 — GNB 가 `position: fixed; top: 0` 이다. 위에 띠를 얹으면 헤더를 밀거나
   덮게 되고, 그 순간 "공개 화면과 같은 렌더" 가 아니게 된다. 아래 띠는 본문 조판을 건드리지
   않는다 (body 의 padding-bottom 만큼만 자리를 낸다 — preview.css).

   ⚠ 승인·반려 버튼은 여기 두지 않는다. 판정은 승인 대기 화면에서 한다 — 미리보기 탭에서
     바로 승인하면 무엇을 승인했는지 목록과 대조하지 않은 채로 눌리게 된다. */
export default function PreviewBar({ status, backHref }: { status: Status; backHref: string }) {
  return (
    <div className="pv-bar" role="status">
      <b className="pv-bar__k">미리보기</b>
      <span className="pv-bar__t">
        <b>{STATUS_LABEL[status]}</b> 상태입니다 — 공개 사이트에는 아직 이 주소가 없습니다.
      </span>
      <Link className="pv-bar__a" href={backHref}>승인 대기로 돌아가기 →</Link>
    </div>
  )
}

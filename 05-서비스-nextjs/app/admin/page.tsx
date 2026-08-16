import { redirect } from 'next/navigation'

/* 로그인 후 첫 화면은 A-02(Insight 관리)다. 별도 운영 대시보드는 만들지 않는다
   (FR-A00-03 · E10). /admin 으로 들어와도 같은 곳으로 보낸다. */
export default function AdminIndexPage() {
  redirect('/admin/insight')
}

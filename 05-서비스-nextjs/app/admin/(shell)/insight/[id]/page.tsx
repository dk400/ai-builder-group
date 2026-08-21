import { requireAdminArea } from '../../_area'
import InsightEditorScreen from './editor'

/* A-03 Insight 편집 (관리자 영역). 화면 본체는 ./editor.tsx 에 있고 빌더 영역과 공유한다.
   generateStaticParams 를 두지 않는다 — 셸이 force-dynamic 이라 프리렌더 목록이 의미가 없고,
   어드민 주소를 빌드 산출물에 박아 둘 이유도 없다. */
export default async function AdminInsightEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminArea()
  return <InsightEditorScreen raw={(await params).id} listHref="/admin/insight" />
}

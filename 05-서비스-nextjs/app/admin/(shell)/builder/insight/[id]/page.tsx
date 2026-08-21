import { requireApprovedBuilderArea } from '../../../_area'
import InsightEditorScreen from '../../../insight/[id]/editor'

/* 빌더 영역의 글 편집. 화면은 관리자와 같고 '목록으로' 만 빌더 영역을 가리킨다.
   무엇을 고칠 수 있는지는 상태 머신과 서버 액션이 정한다 (제출 후 잠금 — DR-07). */
export default async function BuilderInsightEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireApprovedBuilderArea()
  return <InsightEditorScreen raw={(await params).id} listHref="/admin/builder" />
}

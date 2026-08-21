import { requireApprovedBuilderArea } from '../../../_area'
import WorkEditorScreen from '../../../work/[id]/editor'

/* 빌더 영역의 프로젝트 편집. 화면은 관리자와 같고 '목록으로' 만 빌더 영역을 가리킨다. */
export default async function BuilderWorkEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireApprovedBuilderArea()
  return <WorkEditorScreen raw={(await params).id} listHref="/admin/builder/work" />
}

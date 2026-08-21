import { requireAdminArea } from '../../_area'
import WorkEditorScreen from './editor'

/* A-05 Work 편집 (관리자 영역). 본체는 ./editor.tsx — 빌더 영역과 공유한다. */
export default async function AdminWorkEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminArea()
  return <WorkEditorScreen raw={(await params).id} listHref="/admin/work" />
}

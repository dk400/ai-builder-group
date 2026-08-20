'use client'

import { useEffect, useId, useRef, useState } from 'react'

/* 썸네일 업로드 — FR-A03-06 · FR-A05-04 · NFR-14

   ⚠ 이 자리에는 원래 아무 동작도 없는 빈 div 가 있었다. "이미지를 끌어다 놓으세요"라고
     써 두고 놓으면 아무 일도 일어나지 않았다. **없는 것보다 나쁘다** — 사용자는 자기가
     뭘 잘못했는지 찾느라 시간을 쓴다.

   🔴 그 뒤에도 "어떻게 등록하냐"는 질문이 나왔다. 이유는 **이미 이미지가 있을 때**였다:
      바꾸는 방법이 호버해야 뜨는 오버레이 하나뿐이었고(터치 기기에는 호버가 없다),
      저장된 이미지를 지우는 방법은 아예 없었다(제거 버튼이 새로 고른 파일에만 떴다).
      → 미리보기 아래에 **항상 보이는 버튼 줄**을 둔다. 호버 오버레이는 보조일 뿐이다.

   여기서 하는 일:
   · 클릭·키보드·드래그 앤 드롭 세 경로 모두 지원 (라벨 + 실제 file input)
   · 형식·용량 검증을 **고르는 즉시** 한다 (NFR-14: jpg·png·webp·avif, 5MB 이하).
     저장 버튼을 누른 뒤에 알려주면 그때까지 쓴 것을 되돌려야 한다
   · 미리보기. 목록 카드·상세 커버·OG 카드에 같은 이미지가 쓰이므로 잘림을 미리 보여준다

   ⚠ 실제 업로드(Supabase Storage)는 키가 들어온 뒤에 붙는다. 지금은 파일이 폼에 실려
     서버 액션까지 가고, 액션이 "연결되지 않았습니다"를 돌려준다. */

const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif'
const MAX_BYTES = 5 * 1024 * 1024

type Props = {
  /** 폼 필드 이름 */
  name: string
  /** 이미 저장된 이미지 주소 */
  current: string | null
  /** 권장 규격 안내 */
  spec: string
  onDirty?: () => void
  disabled?: boolean
}

export default function ImageDrop({ name, current, spec, onDirty, disabled }: Props) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(current)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [over, setOver] = useState(false)
  /* 저장된 이미지를 지웠다는 사실은 서버가 알아야 한다 — 파일이 안 실렸다는 것만으로는
     "안 바꿨다"와 "지웠다"를 구분할 수 없다 */
  const [cleared, setCleared] = useState(false)

  /* createObjectURL 은 명시적으로 해제하지 않으면 탭이 닫힐 때까지 메모리에 남는다 */
  useEffect(() => {
    return () => { if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview) }
  }, [preview])

  const accept = (file: File | undefined) => {
    if (!file) return
    if (!ACCEPT.split(',').includes(file.type)) {
      setError('jpg · png · webp · avif 만 올릴 수 있습니다.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError(`5MB 이하만 올릴 수 있습니다. (고른 파일 ${(file.size / 1024 / 1024).toFixed(1)}MB)`)
      return
    }
    setError(null)
    setCleared(false)
    setPreview(prev => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setFileName(file.name)
    onDirty?.()
  }

  const clear = () => {
    setPreview(prev => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
      return null
    })
    setFileName(null)
    setError(null)
    setCleared(true)
    if (inputRef.current) inputRef.current.value = ''
    onDirty?.()
  }

  return (
    <>
      <label
        htmlFor={inputId}
        className={'drop drop--pick' + (over ? ' is-over' : '') + (disabled ? ' is-off' : '')}
        onDragOver={e => { if (disabled) return; e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={e => {
          if (disabled) return
          e.preventDefault()
          setOver(false)
          accept(e.dataTransfer.files[0])
        }}
      >
        {preview
          ? <img src={preview} alt="" />
          : (
            <span className="drop__ph">
              {disabled ? '등록된 이미지가 없습니다' : '이미지를 끌어다 놓거나 눌러서 고르세요'}
              <em>{spec}</em>
            </span>
          )}
        {preview && !disabled && <span className="drop__swap">눌러서 바꾸기</span>}
      </label>

      <input
        id={inputId} ref={inputRef} type="file" name={name} accept={ACCEPT}
        className="visually-hidden" disabled={disabled}
        onChange={e => accept(e.target.files?.[0])}
      />
      {cleared && <input type="hidden" name={`${name}Cleared`} value="1" readOnly />}

      {error && <p className="fielderr" role="alert">{error}</p>}

      {/* 🔴 호버에 기대지 않는다. 이미지가 있으면 바꾸는 길과 지우는 길이 항상 보여야 한다 */}
      <div className="drop__acts">
        {disabled ? (
          <span className="hint">검토 중에는 바꿀 수 없습니다</span>
        ) : preview ? (
          <>
            <button type="button" className="abtn abtn--sm" onClick={() => inputRef.current?.click()}>
              이미지 교체
            </button>
            <button type="button" className="abtn abtn--sm" onClick={clear}>제거</button>
            {fileName && <span className="drop__file" title={fileName}>{fileName}</span>}
          </>
        ) : (
          <button type="button" className="abtn abtn--sm" onClick={() => inputRef.current?.click()}>
            이미지 고르기
          </button>
        )}
      </div>
    </>
  )
}

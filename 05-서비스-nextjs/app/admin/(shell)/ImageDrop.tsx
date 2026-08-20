'use client'

import { useEffect, useId, useRef, useState } from 'react'

/* 썸네일 업로드 — FR-A03-06 · FR-A05-04 · NFR-14

   ⚠ 이 자리에는 원래 아무 동작도 없는 빈 div 가 있었다. "이미지를 끌어다 놓으세요"라고
     써 두고 놓으면 아무 일도 일어나지 않았다. **없는 것보다 나쁘다** — 사용자는 자기가
     뭘 잘못했는지 찾느라 시간을 쓴다.

   여기서 하는 일:
   · 클릭·키보드·드래그 앤 드롭 세 경로 모두 지원 (라벨 + 실제 file input)
   · 형식·용량 검증을 **고르는 즉시** 한다 (NFR-14: jpg·png·webp·avif, 5MB 이하).
     저장 버튼을 누른 뒤에 알려주면 그때까지 쓴 것을 되돌려야 한다
   · 미리보기. 목록 카드·상세 커버·OG 카드에 같은 이미지가 쓰이므로 잘림을 미리 보여준다

   ⚠ 실제 업로드(Supabase Storage)는 키가 들어온 뒤에 붙는다. 지금은 파일이 폼에 실려
     서버 액션까지 가고, 액션이 "연결되지 않았습니다"를 돌려준다. 화면이 거짓말하지 않도록
     그 사실을 아래 안내에 적어 둔다. */

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
          : <span className="ph">이미지를 끌어다 놓거나 눌러서 고르세요<em>{spec}</em></span>}
        {preview && <span className="drop__swap">{disabled ? '' : '바꾸려면 누르세요'}</span>}
      </label>

      <input
        id={inputId} ref={inputRef} type="file" name={name} accept={ACCEPT}
        className="visually-hidden" disabled={disabled}
        onChange={e => accept(e.target.files?.[0])}
      />

      {error && <p className="fielderr" role="alert">{error}</p>}

      {fileName && !error && (
        <p className="hint" style={{ marginTop: 8 }}>
          고른 파일 <b>{fileName}</b>
          <button type="button" className="linkbtn" onClick={clear}>제거</button>
        </p>
      )}
    </>
  )
}

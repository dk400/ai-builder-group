'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extensions'
import { useEffect, useState } from 'react'

/* 본문 에디터 — FR-A03-01 (Tiptap 필수) · FR-A03-02 (h1 차단)

   🔴 h1 을 툴바에서 빼는 것으로는 부족하다. 붙여넣기 한 번이면 들어온다.
      그래서 **스키마에서 아예 뺀다** — `heading: { levels: [2, 3, 4] }`.
      레벨 목록에 없는 헤딩은 ProseMirror 문서 모델이 만들지 못하고, 붙여넣은 h1 은
      문단으로 떨어진다. 서버의 sanitize 가 한 번 더 강등하는 것은 그다음 방어선이다
      (요청은 에디터를 거치지 않고도 만들 수 있으므로).

   값은 hidden input 으로 폼에 실린다. 서버 액션이 formData 로 받는 구조라
   에디터 상태를 부모로 끌어올리지 않아도 되고, JS 가 죽어도 폼 자체는 남는다.

   ⚠ immediatelyRender: false 가 없으면 SSR 에서 하이드레이션 불일치가 난다. */

const LINK_PROTOCOLS = ['http', 'https', 'mailto']

type Props = {
  /** 폼에 실릴 필드 이름 */
  name: string
  /** 초기 HTML. 서버에서 이미 sanitize 된 값이다 */
  defaultValue: string | null
  onDirty?: () => void
  /* 🔴 fieldset[disabled] 로는 이 에디터를 막을 수 없다. 그 속성은 폼 컨트롤
     (input·textarea·select·button)만 비활성화하고 contenteditable 은 건드리지 않는다.
     잠긴 화면에서 본문만 편집되는 상태가 실제로 있었다. */
  editable?: boolean
}

export default function BodyEditor({ name, defaultValue, onDirty, editable = true }: Props) {
  const [html, setHtml] = useState(defaultValue ?? '')
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkValue, setLinkValue] = useState('')

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        /* 본문에는 h2~h4 만 존재한다. h1 은 페이지 제목의 몫이다 */
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,          // 편집 중에 링크를 누르면 페이지가 떠난다
          autolink: true,
          protocols: LINK_PROTOCOLS,   // javascript: 를 스키마 단계에서 막는다
          HTMLAttributes: { rel: 'noopener noreferrer' },
        },
        /* 코드블록은 이 사이트 본문 스타일에 없다. 넣으면 공개 화면에서 스타일 없는
           덩어리로 나간다 — 렌더러에 없는 기능은 에디터에도 두지 않는다. */
        codeBlock: false,
      }),
      /* 빈 화면에 아무 안내도 없으면 "여기에 쓰면 되나" 부터 막힌다.
         placeholder 는 실제 텍스트가 아니라 CSS ::before 로 그려져 본문에 섞이지 않는다. */
      Placeholder.configure({
        placeholder: '여기에 본문을 씁니다. 소제목은 H2 부터 시작합니다.',
      }),
    ],
    content: defaultValue ?? '',
    editorProps: {
      attributes: {
        class: 'ed__body',
        'aria-label': '본문',
        role: 'textbox',
        'aria-multiline': 'true',
      },
    },
    onUpdate({ editor }) {
      setHtml(editor.isEmpty ? '' : editor.getHTML())
      onDirty?.()
    },
  })

  /* 잠금이 바뀌면 에디터에도 반영한다. useEditor 옵션은 최초 1회만 읽힌다 */
  useEffect(() => { editor?.setEditable(editable) }, [editor, editable])

  /* 언마운트 정리는 useEditor 가 하지만, 폼이 다른 글로 갈아끼워질 때 초기값을 다시 넣어야 한다 */
  useEffect(() => {
    if (editor && defaultValue !== null && editor.isEmpty && defaultValue !== '') {
      editor.commands.setContent(defaultValue, { emitUpdate: false })
    }
  }, [editor, defaultValue])

  if (!editor) {
    return (
      <div className="ed">
        <div className="ed__bar" />
        <div className="ed__body ed__body--empty"><p>에디터를 불러오는 중…</p></div>
      </div>
    )
  }

  const applyLink = () => {
    const value = linkValue.trim()
    if (value === '') {
      editor.chain().focus().unsetLink().run()
    } else {
      /* 프로토콜이 없으면 https 를 붙인다. 없는 채로 두면 상대 경로로 해석돼
         우리 도메인 안쪽을 가리키는 죽은 링크가 된다. */
      const href = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    }
    setLinkOpen(false)
    setLinkValue('')
    onDirty?.()
  }

  return (
    <div className="ed">
      {editable && <div className="ed__bar" role="toolbar" aria-label="본문 서식">
        <Tool ed={editor} on="heading" attrs={{ level: 2 }} run={e => e.toggleHeading({ level: 2 })} label="H2" title="소제목" />
        <Tool ed={editor} on="heading" attrs={{ level: 3 }} run={e => e.toggleHeading({ level: 3 })} label="H3" title="작은 소제목" />
        <span className="sep" aria-hidden="true" />
        <Tool ed={editor} on="bold" run={e => e.toggleBold()} label="B" title="굵게" />
        <Tool ed={editor} on="italic" run={e => e.toggleItalic()} label="I" title="기울임" />
        <Tool ed={editor} on="strike" run={e => e.toggleStrike()} label="S" title="취소선" />
        <span className="sep" aria-hidden="true" />
        <Tool ed={editor} on="blockquote" run={e => e.toggleBlockquote()} label="“”" title="인용" />
        <Tool ed={editor} on="bulletList" run={e => e.toggleBulletList()} label="•" title="글머리 목록" />
        <Tool ed={editor} on="orderedList" run={e => e.toggleOrderedList()} label="1." title="번호 목록" />
        <span className="sep" aria-hidden="true" />
        <button
          type="button" title="링크"
          aria-pressed={editor.isActive('link')}
          className={editor.isActive('link') ? 'on' : undefined}
          onClick={() => {
            setLinkValue(editor.getAttributes('link').href ?? '')
            setLinkOpen(v => !v)
          }}
        >🔗</button>
        <button type="button" title="구분선" onClick={() => { editor.chain().focus().setHorizontalRule().run(); onDirty?.() }}>⌗</button>
        <span className="note">H1 없음 — 페이지 제목이 h1</span>
      </div>}

      {/* 링크 입력. window.prompt 를 쓰지 않는다 — 모달이 뜨는 동안 선택 영역이 풀리고,
          모바일에서는 붙여넣기가 어렵다. */}
      {editable && linkOpen && (
        <div className="ed__link">
          <input
            type="url" value={linkValue} autoFocus
            placeholder="https://example.com"
            aria-label="링크 주소"
            onChange={e => setLinkValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); applyLink() }
              if (e.key === 'Escape') { setLinkOpen(false); setLinkValue('') }
            }}
          />
          <button type="button" className="abtn abtn--sm" onClick={applyLink}>적용</button>
          <button type="button" className="abtn abtn--sm" onClick={() => { setLinkValue(''); applyLink() }}>제거</button>
        </div>
      )}

      {!editable && editor.isEmpty
        ? <div className="ed__body ed__body--empty"><p>본문이 아직 비어 있습니다.</p></div>
        : <EditorContent editor={editor} />}
      {/* 서버 액션은 formData 로 받는다. 에디터 상태를 부모로 끌어올릴 이유가 없다 */}
      <input type="hidden" name={name} value={html} readOnly />
    </div>
  )
}

/* 툴바 버튼 하나. 활성 상태를 aria-pressed 로도 알린다 — 색만으로 상태를 전하면
   스크린리더에서는 아무 차이가 없다 (NFR-07 · NFR-08). */
function Tool({
  ed, on, attrs, run, label, title,
}: {
  ed: Editor
  on: string
  attrs?: Record<string, unknown>
  run: (chain: ReturnType<Editor['chain']>) => { run: () => boolean }
  label: string
  title: string
}) {
  const active = attrs ? ed.isActive(on, attrs) : ed.isActive(on)
  return (
    <button
      type="button" title={title} aria-pressed={active}
      className={active ? 'on' : undefined}
      onClick={() => run(ed.chain().focus()).run()}
    >{label}</button>
  )
}

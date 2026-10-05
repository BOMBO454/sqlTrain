import Editor, { type OnMount } from '@monaco-editor/react'
import type { editor, Position } from 'monaco-editor'
import { useEffect, useRef } from 'react'
import type { SchemaTable } from '../lib/sql/types.ts'
import { columnHover, suggestSql } from '../lib/viz/suggest.ts'

export type SqlEditorHandle = {
  insert: (text: string) => void
  focus: () => void
}

type Monaco = Parameters<OnMount>[1]
type EditorInstance = Parameters<OnMount>[0]

let providersReady = false

export function SqlEditor({
  value,
  onChange,
  schema,
  dark,
  onRun,
  onCheck,
  onFormat,
  handleRef,
}: {
  value: string
  onChange: (value: string) => void
  schema: SchemaTable[]
  dark: boolean
  onRun: () => void
  onCheck?: () => void
  onFormat: () => void
  handleRef: { current: SqlEditorHandle | null }
}) {
  const editorRef = useRef<EditorInstance | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const schemaRef = useRef(schema)
  const onRunRef = useRef(onRun)
  const onCheckRef = useRef(onCheck)
  const onFormatRef = useRef(onFormat)
  useEffect(() => {
    schemaRef.current = schema
    onRunRef.current = onRun
    onCheckRef.current = onCheck
    onFormatRef.current = onFormat
  })

  useEffect(() => {
    handleRef.current = {
      insert(text: string) {
        const editor = editorRef.current
        if (!editor) return
        const selection = editor.getSelection()
        editor.executeEdits('schema', [
          {
            range: selection ?? {
              startLineNumber: 1,
              startColumn: 1,
              endLineNumber: 1,
              endColumn: 1,
            },
            text,
            forceMoveMarkers: true,
          },
        ])
        editor.focus()
      },
      focus() {
        editorRef.current?.focus()
      },
    }
  }, [handleRef])

  const onMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    monaco.editor.defineTheme('verstak-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#fffaf2',
        'editor.foreground': '#1c1915',
        'editorLineNumber.foreground': '#8a8175',
        'editor.selectionBackground': '#f0d3b8',
        'editorCursor.foreground': '#e07a2f',
      },
    })
    monaco.editor.defineTheme('verstak-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#211d18',
        'editor.foreground': '#f3ecdf',
        'editorLineNumber.foreground': '#8d8478',
        'editor.selectionBackground': '#5a3d28',
        'editorCursor.foreground': '#e08a3c',
      },
    })
    monaco.editor.setTheme(document.documentElement.classList.contains('dark') ? 'verstak-dark' : 'verstak-light')
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => onRunRef.current())
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => onCheckRef.current?.())
    editor.addCommand(monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => onFormatRef.current())
    if (providersReady) return
    providersReady = true
    monaco.languages.registerCompletionItemProvider('sql', {
      triggerCharacters: [' ', '.', '('],
      provideCompletionItems(model: editor.ITextModel, position: Position) {
        const before = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        })
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }
        const suggestions = suggestSql(before, schemaRef.current).map((item) => ({
          label: item.label,
          detail: item.detail,
          insertText: item.insertText,
          kind: kindOf(monaco, item.kind),
          sortText: sortOf(item.kind) + item.label,
          range,
          insertTextRules: item.snippet
            ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
            : undefined,
        }))
        return { suggestions }
      },
    })
    monaco.languages.registerHoverProvider('sql', {
      provideHover(model: editor.ITextModel, position: Position) {
        const word = model.getWordAtPosition(position)
        if (!word) return null
        const text = columnHover(word.word, schemaRef.current)
        if (!text) return null
        return {
          range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
          contents: text.split('\n\n').map((value) => ({ value })),
        }
      },
    })
  }

  return (
    <div className="relative min-h-[320px] flex-1">
      <div className="absolute inset-0">
        <Editor
          language="sql"
          theme={dark ? 'verstak-dark' : 'verstak-light'}
          value={value}
          onChange={(next) => onChange(next ?? '')}
          onMount={onMount}
          options={{
            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
            fontSize: 14,
            minimap: { enabled: false },
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'line',
            overviewRulerLanes: 0,
            suggestOnTriggerCharacters: true,
            quickSuggestions: { other: true, comments: false, strings: false },
            fixedOverflowWidgets: true,
          }}
        />
      </div>
    </div>
  )
}

function kindOf(monaco: Monaco, kind: string) {
  const kinds = monaco.languages.CompletionItemKind
  if (kind === 'table') return kinds.Class
  if (kind === 'column') return kinds.Field
  if (kind === 'function') return kinds.Function
  if (kind === 'snippet') return kinds.Snippet
  return kinds.Keyword
}

function sortOf(kind: string): string {
  if (kind === 'column' || kind === 'table') return '0'
  if (kind === 'function') return '1'
  if (kind === 'snippet') return '2'
  return '3'
}

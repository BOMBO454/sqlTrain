import { useEffect, useRef, useState } from 'react'
import { ResultView } from '../components/ResultView.tsx'
import { SchemaCards } from '../components/SchemaCards.tsx'
import { SqlEditor, type SqlEditorHandle } from '../components/SqlEditor.tsx'
import { btn, btnAmber, panel, panelHead } from '../components/styles.ts'
import { VizPanel } from '../components/VizPanel.tsx'
import { Workbench } from '../components/Workbench.tsx'
import { datasets } from '../content/catalog.ts'
import { csvToSql } from '../lib/csv.ts'
import { formatSql } from '../lib/formatSql.ts'
import { clearSandbox, readSandbox, writeSandbox } from '../lib/storage.ts'
import { runSandbox } from '../lib/sql/client.ts'
import { guardSandboxSql } from '../lib/sql/guard.ts'
import type { BatchEntry, SchemaTable, SqlTable } from '../lib/sql/types.ts'
import { buildPipeline, type Pipeline } from '../lib/viz/pipeline.ts'
import { applyTheme, useUi } from '../store/ui.ts'

type Tab = 'result' | 'viz'

export function SandboxPage() {
  const [datasetId, setDatasetId] = useState('shop')
  const dataset = datasets.find((item) => item.id === datasetId) ?? datasets[0]
  const [snapshot, setSnapshot] = useState<Uint8Array | null>(null)
  const [ready, setReady] = useState(false)
  const [schema, setSchema] = useState<SchemaTable[] | null>(null)
  const [schemaError, setSchemaError] = useState<string | null>(null)
  const [sql, setSql] = useState('SELECT *\nFROM customers\n')
  const [table, setTable] = useState<SqlTable | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [rowsAffected, setRowsAffected] = useState<number | null>(null)
  const [pipeline, setPipeline] = useState<Pipeline | null>(null)
  const [samples, setSamples] = useState<Record<string, BatchEntry> | null>(null)
  const [tab, setTab] = useState<Tab>('result')
  const [history, setHistory] = useState<{ sql: string; at: number }[]>([])
  const [csvName, setCsvName] = useState('import')
  const [csvText, setCsvText] = useState('name,city\nАня,Казань\n')
  const [busy, setBusy] = useState(false)
  const editorRef = useRef<SqlEditorHandle | null>(null)
  const liveRun = useUi((state) => state.liveRun)
  const setLiveRun = useUi((state) => state.setLiveRun)
  const theme = useUi((state) => state.theme)
  const dark = applyTheme(theme)
  const token = useRef(0)

  useEffect(() => {
    let cancel = false
    setReady(false)
    setSchema(null)
    readSandbox(dataset.id)
      .then((saved) => runSandbox(dataset.sql, saved?.snapshot ? new Uint8Array(saved.snapshot) : null, null))
      .then((outcome) => {
        if (cancel) return
        setSnapshot(outcome.snapshot)
        setSchema(outcome.tables)
        setSchemaError(null)
        setReady(true)
      })
      .catch((reason: unknown) => {
        if (cancel) return
        setSchemaError(reason instanceof Error ? reason.message : 'База не открылась')
      })
    readSandbox(dataset.id).then((saved) => {
      if (!cancel) setHistory(saved?.history ?? [])
    })
    return () => {
      cancel = true
    }
  }, [dataset.id, dataset.sql])

  useEffect(() => {
    if (!ready || !liveRun) return
    if (!/^\s*(select|with)\b/iu.test(sql)) return
    const timer = window.setTimeout(() => {
      void execute(false)
    }, 500)
    return () => window.clearTimeout(timer)
  }, [sql, ready, liveRun])

  async function execute(recordHistory: boolean) {
    const current = ++token.current
    const guarded = guardSandboxSql(sql)
    if (!guarded.ok) {
      setError(guarded.reason)
      return
    }
    setBusy(true)
    setError(null)
    try {
      const outcome = await runSandbox(dataset.sql, snapshot, sql)
      if (current !== token.current) return
      setSnapshot(outcome.snapshot)
      setSchema(outcome.tables)
      setTable(outcome.table)
      setRowsAffected(outcome.rowsAffected)
      setNote(null)
      const plan = /^\s*(select|with)\b/iu.test(sql) ? buildPipeline(sql) : null
      setPipeline(plan)
      if (plan?.supported) {
        const seeded = outcome.snapshot
        const batch: Record<string, BatchEntry> = {}
        for (let index = 0; index < plan.stages.length; index += 1) {
          const stage = plan.stages[index]
          try {
            const step = await runSandbox(dataset.sql, seeded, stage.sql)
            batch[`s${index}`] = { ok: true, table: step.table }
          } catch (reason) {
            batch[`s${index}`] = { ok: false, error: reason instanceof Error ? reason.message : 'Шаг не посчитался' }
          }
        }
        if (current !== token.current) return
        setSamples(batch)
      } else setSamples(null)
      if (recordHistory) {
        const nextHistory = [{ sql, at: Date.now() }, ...history.filter((item) => item.sql !== sql)].slice(0, 30)
        setHistory(nextHistory)
        const copy = new Uint8Array(outcome.snapshot.byteLength)
        copy.set(outcome.snapshot)
        await writeSandbox(dataset.id, { snapshot: copy.buffer, history: nextHistory })
      }
    } catch (reason) {
      if (current !== token.current) return
      setError(reason instanceof Error ? reason.message : 'Запрос не выполнился')
      setTable(null)
    } finally {
      if (current === token.current) setBusy(false)
    }
  }

  async function reset() {
    await clearSandbox(dataset.id)
    setHistory([])
    setReady(false)
    const outcome = await runSandbox(dataset.sql, null, null)
    setSnapshot(outcome.snapshot)
    setSchema(outcome.tables)
    setTable(null)
    setReady(true)
  }

  async function importCsv() {
    try {
      const built = csvToSql(csvName.trim(), csvText)
      const outcome = await runSandbox(dataset.sql, snapshot, built.sql)
      setSnapshot(outcome.snapshot)
      setSchema(outcome.tables)
      setNote(`Таблица ${csvName.trim()} создана, строк: ${built.rowCount}.`)
      setError(null)
      const copy = new Uint8Array(outcome.snapshot.byteLength)
      copy.set(outcome.snapshot)
      await writeSandbox(dataset.id, { snapshot: copy.buffer, history })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'CSV не разобрался')
    }
  }

  return (
    <Workbench
      left={
        <section className={`${panel} h-full`}>
          <header className={panelHead}>
            <span>База</span>
            <button type="button" className={btn} onClick={() => void reset()}>
              Исходные данные
            </button>
          </header>
          <div className="min-h-0 flex-1 space-y-4 overflow-auto p-3">
            <div className="flex flex-wrap gap-2">
              {datasets.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === dataset.id ? btnAmber : btn}
                  onClick={() => setDatasetId(item.id)}
                >
                  {item.title}
                </button>
              ))}
            </div>
            <p>{dataset.note}</p>
            <SchemaCards tables={schema} error={schemaError} onInsert={(text) => editorRef.current?.insert(text)} />
            <div className="space-y-2 border-2 border-line p-3">
              <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">Своя таблица из CSV</p>
              <label className="block font-mono text-[12px]">
                Имя
                <input
                  className="mt-1 w-full border-2 border-line bg-paper px-2 py-1"
                  value={csvName}
                  onChange={(event) => setCsvName(event.target.value)}
                />
              </label>
              <textarea
                className="h-28 w-full border-2 border-line bg-paper p-2 font-mono text-[12px]"
                value={csvText}
                onChange={(event) => setCsvText(event.target.value)}
              />
              <button type="button" className={btn} onClick={() => void importCsv()}>
                Загрузить в базу
              </button>
            </div>
            {history.length > 0 ? (
              <div>
                <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">История</p>
                <ul className="mt-1 space-y-1">
                  {history.map((item) => (
                    <li key={item.at}>
                      <button
                        type="button"
                        className="w-full truncate text-left font-mono text-[12px] hover:bg-amber/20"
                        onClick={() => setSql(item.sql)}
                      >
                        {item.sql.replaceAll('\n', ' ')}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      }
      center={
        <section id="editor" className={`${panel} h-full`}>
          <header className={panelHead}>
            <span>Песочница</span>
            <label className="flex items-center gap-2 normal-case tracking-normal">
              <input type="checkbox" checked={liveRun} onChange={(event) => setLiveRun(event.target.checked)} />
              SELECT на лету
            </label>
          </header>
          <div className="flex flex-wrap gap-2 border-b border-line/30 p-2">
            <button type="button" className={btnAmber} disabled={busy || !ready} onClick={() => void execute(true)}>
              Выполнить
            </button>
            <button
              type="button"
              className={btn}
              onClick={() => {
                try {
                  setSql(formatSql(sql))
                } catch {
                  setError('Форматтер не осилил этот текст.')
                }
              }}
            >
              Формат
            </button>
          </div>
          <SqlEditor
            value={sql}
            onChange={setSql}
            schema={schema ?? []}
            dark={dark}
            onRun={() => void execute(true)}
            onFormat={() => {
              try {
                setSql(formatSql(sql))
              } catch {
                setError('Форматтер не осилил этот текст.')
              }
            }}
            handleRef={editorRef}
          />
        </section>
      }
      right={
        <section className={`${panel} h-full`}>
          <header className={panelHead}>
            <div className="flex gap-3 normal-case">
              <button type="button" className={tab === 'result' ? 'underline decoration-amber decoration-2 underline-offset-4' : 'text-muted'} onClick={() => setTab('result')}>
                Результат
              </button>
              <button type="button" className={tab === 'viz' ? 'underline decoration-amber decoration-2 underline-offset-4' : 'text-muted'} onClick={() => setTab('viz')}>
                Как считается
              </button>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-auto p-3">
            {tab === 'result' ? (
              <ResultView table={table} error={error} note={note} grade={null} rowsAffected={rowsAffected} />
            ) : (
              <VizPanel pipeline={pipeline} samples={samples} />
            )}
          </div>
        </section>
      }
    />
  )
}

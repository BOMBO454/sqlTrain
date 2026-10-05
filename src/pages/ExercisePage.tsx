import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Dialog } from '../components/Dialog.tsx'
import { Markdown } from '../components/Markdown.tsx'
import { ResultView } from '../components/ResultView.tsx'
import { SchemaCards } from '../components/SchemaCards.tsx'
import { SqlEditor, type SqlEditorHandle } from '../components/SqlEditor.tsx'
import { panel, panelHead, btn, btnAmber, btnTeal } from '../components/styles.ts'
import { useSchema } from '../components/useSchema.ts'
import { VizPanel } from '../components/VizPanel.tsx'
import { Workbench } from '../components/Workbench.tsx'
import { exerciseById, neighborExercise, seeds, topics } from '../content/catalog.ts'
import { levelName } from '../content/level.ts'
import { compareTables, type Grade } from '../lib/grade/compare.ts'
import { formatSql } from '../lib/formatSql.ts'
import { readDraft, readProgress, writeDraft, writeProgress, type Progress } from '../lib/storage.ts'
import { runBatch, runSeeded } from '../lib/sql/client.ts'
import { guardExerciseSql } from '../lib/sql/guard.ts'
import type { BatchEntry, SqlTable } from '../lib/sql/types.ts'
import { buildPipeline, type Pipeline } from '../lib/viz/pipeline.ts'
import { applyTheme, useUi } from '../store/ui.ts'

type Tab = 'result' | 'viz' | 'schema'

export function ExercisePage() {
  const { exerciseId } = useParams()
  const exercise = exerciseById(exerciseId ?? '')
  if (!exercise) {
    return (
      <div className="p-6">
        <p>Такого упражнения нет.</p>
        <Link to="/">Ко всем темам</Link>
      </div>
    )
  }
  return <ExerciseWorkspace key={exercise.id} exerciseId={exercise.id} />
}

function ExerciseWorkspace({ exerciseId }: { exerciseId: string }) {
  const exercise = exerciseById(exerciseId)!
  const topic = topics.find((item) => item.id === exercise.topicId)
  const seed = seeds[exercise.seedId]
  const { tables: schema, error: schemaError } = useSchema(seed.visible)
  const editorRef = useRef<SqlEditorHandle | null>(null)
  const [sql, setSql] = useState(exercise.starterSql)
  const [draftReady, setDraftReady] = useState(false)
  const [table, setTable] = useState<SqlTable | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [grade, setGrade] = useState<Grade | null>(null)
  const [pipeline, setPipeline] = useState<Pipeline | null>(null)
  const [samples, setSamples] = useState<Record<string, BatchEntry> | null>(null)
  const [tab, setTab] = useState<Tab>('result')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [hintCount, setHintCount] = useState(0)
  const [askSolution, setAskSolution] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [askReset, setAskReset] = useState(false)
  const liveRun = useUi((state) => state.liveRun)
  const setLiveRun = useUi((state) => state.setLiveRun)
  const setLastExerciseId = useUi((state) => state.setLastExerciseId)
  const theme = useUi((state) => state.theme)
  const dark = applyTheme(theme)
  const token = useRef(0)

  useEffect(() => {
    setLastExerciseId(exercise.id)
  }, [exercise.id, setLastExerciseId])

  useEffect(() => {
    let cancel = false
    readDraft(exercise.id).then((draft) => {
      if (cancel) return
      if (draft !== null) setSql(draft)
      setDraftReady(true)
    })
    readProgress().then((all) => {
      if (cancel) return
      const row = all[exercise.id]
      if (!row) return
      setProgress(row)
      setHintCount(row.hintsUsed)
      setShowSolution(row.solutionSeen)
    })
    return () => {
      cancel = true
    }
  }, [exercise.id])

  useEffect(() => {
    if (!draftReady) return
    const timer = window.setTimeout(() => {
      writeDraft(exercise.id, sql).catch(() => undefined)
    }, 400)
    return () => window.clearTimeout(timer)
  }, [sql, draftReady, exercise.id])

  useEffect(() => {
    if (!liveRun || !draftReady) return
    const timer = window.setTimeout(() => {
      void run('run')
    }, 500)
    return () => window.clearTimeout(timer)
    }, [sql, liveRun, draftReady])

  async function run(mode: 'run' | 'check') {
    const current = ++token.current
    const guarded = guardExerciseSql(sql)
    if (!guarded.ok) {
      setError(guarded.reason)
      setTable(null)
      setNote(null)
      if (mode === 'check') setGrade(null)
      return
    }
    setBusy(true)
    setError(null)
    try {
      const plan = buildPipeline(sql)
      setPipeline(plan)
      const queries = [{ id: 'user', sql }]
      if (plan.supported) {
        plan.stages.forEach((stage, index) => queries.push({ id: `s${index}`, sql: stage.sql }))
      }
      const batch = await runBatch(seed.visible, queries)
      if (current !== token.current) return
      setSamples(batch)
      const user = batch.user
      if (!user?.ok) {
        setTable(null)
        setError(user?.error ?? 'Запрос не выполнился')
        setGrade(null)
        setTab('result')
        return
      }
      setTable(user.table)
      setNote(null)
      if (mode === 'run') return
      const solution = await runSeeded(seed.visible, exercise.solutionSql)
      if (current !== token.current) return
      let next = compareTables(user.table, solution.table, exercise.orderMatters)
      if (next.status === 'ok') {
        for (const hidden of [seed.hidden]) {
          const hiddenUser = await runSeeded(hidden, sql)
          const hiddenSolution = await runSeeded(hidden, exercise.solutionSql)
          if (current !== token.current) return
          const hiddenGrade = compareTables(hiddenUser.table, hiddenSolution.table, exercise.orderMatters)
          if (hiddenGrade.status !== 'ok') {
            next = {
              status: 'mismatch',
              message:
                'На учебных данных сошлось, на проверочных — нет. Ответ завязан на конкретные строки, а не на правило.',
              expectedColumns: solution.table.columns,
              actualColumns: user.table.columns,
              missing: [],
              extra: [],
            }
            break
          }
        }
      }
      setGrade(next)
      const previous = progress
      const updated: Progress = {
        solved: previous?.solved || next.status === 'ok',
        attempts: (previous?.attempts ?? 0) + 1,
        hintsUsed: Math.max(previous?.hintsUsed ?? 0, hintCount),
        solutionSeen: previous?.solutionSeen || showSolution,
        updatedAt: Date.now(),
      }
      setProgress(updated)
      await writeProgress(exercise.id, updated)
    } catch (reason) {
      if (current !== token.current) return
      setError(reason instanceof Error ? reason.message : 'Запрос не выполнился')
      setTable(null)
    } finally {
      if (current === token.current) setBusy(false)
    }
  }

  function revealHint() {
    const nextCount = Math.min(3, hintCount + 1)
    setHintCount(nextCount)
    const updated: Progress = {
      solved: progress?.solved ?? false,
      attempts: progress?.attempts ?? 0,
      hintsUsed: nextCount,
      solutionSeen: progress?.solutionSeen ?? showSolution,
      updatedAt: Date.now(),
    }
    setProgress(updated)
    writeProgress(exercise.id, updated).catch(() => undefined)
  }

  function openSolution() {
    setShowSolution(true)
    setAskSolution(false)
    const updated: Progress = {
      solved: progress?.solved ?? false,
      attempts: progress?.attempts ?? 0,
      hintsUsed: progress?.hintsUsed ?? hintCount,
      solutionSeen: true,
      updatedAt: Date.now(),
    }
    setProgress(updated)
    writeProgress(exercise.id, updated).catch(() => undefined)
  }

  const prev = neighborExercise(exercise.id, -1)
  const next = neighborExercise(exercise.id, 1)

  return (
    <>
    <Workbench
      left={
        <section className={`${panel} h-full`}>
          <header className={panelHead}>
            <span>{topic?.title ?? 'Задача'}</span>
            <span>{progress?.solved ? 'решено' : busy ? 'считаю' : 'черновик'}</span>
          </header>
          <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
            <div>
              <p className="font-mono text-[12px] tracking-[0.14em] text-amber uppercase">{levelName[exercise.level]}</p>
              <h1 className="mt-1 font-display text-4xl leading-none font-semibold">{exercise.title}</h1>
              <div className="mt-3 border-l-4 border-teal pl-3">
                <p className="font-mono text-[11px] tracking-[0.14em] text-teal uppercase">Теория</p>
                <div className="mt-1">
                  <Markdown text={exercise.theory} />
                </div>
              </div>
              <p className="mt-3">{exercise.prompt}</p>
              {exercise.orderMatters ? <p className="mt-2 text-muted">Порядок строк важен.</p> : null}
              {exercise.dialectNote ? <p className="mt-2 text-muted">{exercise.dialectNote}</p> : null}
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">Столбцы ответа</p>
              <ul className="mt-1 flex flex-wrap gap-1">
                {exercise.columns.map((column) => (
                  <li key={column} className="border border-line px-2 py-0.5 font-mono text-[12px]">
                    {column}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              {exercise.hints.slice(0, hintCount).map((hint, index) => (
                <p key={index} className="border-l-4 border-amber pl-3">
                  {hint}
                </p>
              ))}
              {hintCount < 3 ? (
                <button type="button" className={btn} onClick={revealHint}>
                  Подсказка {hintCount + 1} из 3
                </button>
              ) : null}
            </div>
            {showSolution ? (
              <div className="space-y-2 border-2 border-line bg-paper p-3">
                <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">Решение</p>
                <pre className="overflow-auto font-mono text-[12px] whitespace-pre-wrap">{exercise.solutionSql}</pre>
                <Markdown text={exercise.explanation} />
                <button type="button" className={btn} onClick={() => setSql(exercise.solutionSql)}>
                  Вставить в редактор
                </button>
              </div>
            ) : (
              <button type="button" className={btn} onClick={() => setAskSolution(true)}>
                Показать решение
              </button>
            )}
            <div className="flex flex-wrap gap-3 font-mono text-[12px]">
              {prev ? <Link to={`/exercise/${prev.id}`}>← {prev.title}</Link> : <span />}
              {next ? <Link to={`/exercise/${next.id}`}>{next.title} →</Link> : null}
            </div>
          </div>
        </section>
      }
      center={
        <section id="editor" className={`${panel} h-full`}>
          <header className={panelHead}>
            <span>Запрос</span>
            <label className="flex items-center gap-2 normal-case tracking-normal">
              <input
                type="checkbox"
                checked={liveRun}
                onChange={(event) => setLiveRun(event.target.checked)}
              />
              на лету
            </label>
          </header>
          <div className="flex flex-wrap gap-2 border-b border-line/30 p-2">
            <button type="button" className={btnAmber} onClick={() => void run('run')} disabled={busy}>
              Выполнить
            </button>
            <button type="button" className={btnTeal} onClick={() => void run('check')} disabled={busy}>
              Проверить
            </button>
            <button
              type="button"
              className={btn}
              onClick={() => {
                try {
                  setSql(formatSql(sql))
                } catch {
                  setError('Форматтер не осилил этот текст. Запрос оставлен как есть.')
                  setTab('result')
                }
              }}
            >
              Формат
            </button>
            <button type="button" className={btn} onClick={() => setAskReset(true)}>
              К заготовке
            </button>
          </div>
          <SqlEditor
            value={sql}
            onChange={(next) => {
              setSql(next)
              setGrade(null)
            }}
            schema={schema ?? []}
            dark={dark}
            onRun={() => void run('run')}
            onCheck={() => void run('check')}
            onFormat={() => {
              try {
                setSql(formatSql(sql))
              } catch {
                setNote('Форматтер не осилил этот текст.')
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
              <TabButton current={tab} id="result" onSelect={setTab}>
                Результат
              </TabButton>
              <TabButton current={tab} id="viz" onSelect={setTab}>
                Как считается
              </TabButton>
              <TabButton current={tab} id="schema" onSelect={setTab}>
                Схема
              </TabButton>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-auto p-3">
            {tab === 'result' ? <ResultView table={table} error={error} note={note} grade={grade} rowsAffected={null} /> : null}
            {tab === 'viz' ? <VizPanel pipeline={pipeline} samples={samples} /> : null}
            {tab === 'schema' ? (
              <SchemaCards
                tables={schema}
                error={schemaError}
                onInsert={(text) => editorRef.current?.insert(text)}
              />
            ) : null}
          </div>
        </section>
      }
    />
    {askSolution ? (
      <Dialog title="Показать решение?" onClose={() => setAskSolution(false)}>
        <p>Ответ откроется целиком. Упражнение можно сдать и после этого.</p>
        <button type="button" className={btnAmber} onClick={openSolution}>
          Показать
        </button>
      </Dialog>
    ) : null}
    {askReset ? (
      <Dialog title="Вернуть заготовку?" onClose={() => setAskReset(false)}>
        <p>Текущий текст запроса заменится стартовым. Черновик тоже.</p>
        <button
          type="button"
          className={btnAmber}
          onClick={() => {
            setSql(exercise.starterSql)
            setGrade(null)
            setAskReset(false)
          }}
        >
          Вернуть
        </button>
      </Dialog>
    ) : null}
    </>
  )
}

function TabButton({
  current,
  id,
  onSelect,
  children,
}: {
  current: Tab
  id: Tab
  onSelect: (tab: Tab) => void
  children: string
}) {
  return (
    <button
      type="button"
      className={current === id ? 'text-ink underline decoration-amber decoration-2 underline-offset-4' : 'text-muted'}
      onClick={() => onSelect(id)}
    >
      {children}
    </button>
  )
}

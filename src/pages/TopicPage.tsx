import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Markdown } from '../components/Markdown.tsx'
import { topics } from '../content/catalog.ts'
import { levelName } from '../content/level.ts'
import { readProgress, type Progress } from '../lib/storage.ts'

export function TopicPage() {
  const { topicId } = useParams()
  const topic = topics.find((item) => item.id === topicId)
  const [progress, setProgress] = useState<Record<string, Progress>>({})

  useEffect(() => {
    readProgress().then(setProgress).catch(() => setProgress({}))
  }, [])

  if (!topic) {
    return (
      <div className="p-6">
        <p>Такой темы нет.</p>
        <Link to="/" className="underline">
          Ко всем темам
        </Link>
      </div>
    )
  }

  const rows: { key: string; number: number | null; lesson: (typeof topic.lessons)[number] }[] = []
  let exerciseNumber = 0
  for (const lesson of topic.lessons) {
    if (lesson.kind === 'theory') {
      rows.push({ key: lesson.id, number: null, lesson })
    } else {
      exerciseNumber += 1
      rows.push({ key: lesson.exercise.id, number: exerciseNumber, lesson })
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link to="/" className="font-mono text-[12px] text-muted">
        ← Темы
      </Link>
      <p className="mt-3 font-mono text-[12px] text-amber">{topic.kicker}</p>
      <h1 className="font-display text-6xl leading-none font-semibold">{topic.title}</h1>
      <p className="mt-3 max-w-xl">{topic.blurb}</p>
      <ol className="mt-6 border-2 border-line bg-card">
        {rows.map(({ key, number, lesson }) => {
          if (lesson.kind === 'theory') {
            return (
              <li key={key} className="border-b-2 border-line px-4 py-4 last:border-b-0">
                <p className="font-mono text-[12px] tracking-[0.14em] text-teal uppercase">Теория</p>
                <h2 className="mt-1 font-display text-3xl leading-none font-semibold">{lesson.title}</h2>
                <div className="mt-3">
                  <Markdown text={lesson.body} />
                </div>
              </li>
            )
          }
          const exercise = lesson.exercise
          const row = progress[exercise.id]
          return (
            <li key={key} className="border-b-2 border-line last:border-b-0">
              <Link to={`/exercise/${exercise.id}`} className="flex items-baseline justify-between gap-4 px-4 py-3 hover:bg-amber/15">
                <span>
                  <span className="mr-3 font-mono text-[12px] text-muted">{String(number).padStart(2, '0')}</span>
                  <span className="font-display text-3xl leading-none font-semibold">{exercise.title}</span>
                </span>
                <span className="font-mono text-[12px] text-muted">
                  {levelName[exercise.level]}
                  {' · '}
                  {row?.solved ? 'решено' : row ? `попыток ${row.attempts}` : 'не открыто'}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

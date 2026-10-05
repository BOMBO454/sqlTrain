import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { exercises, exerciseById, topics } from '../content/catalog.ts'
import { readProgress, type Progress } from '../lib/storage.ts'
import { useUi } from '../store/ui.ts'
import { btnAmber, btnTeal } from '../components/styles.ts'
import { levelName } from '../content/level.ts'

export function HomePage() {
  const lastExerciseId = useUi((state) => state.lastExerciseId)
  const [progress, setProgress] = useState<Record<string, Progress>>({})

  useEffect(() => {
    readProgress().then(setProgress).catch(() => setProgress({}))
  }, [])

  const solved = exercises.filter((exercise) => progress[exercise.id]?.solved).length
  const last = (lastExerciseId && exerciseById(lastExerciseId)) || exercises.find((exercise) => !progress[exercise.id]?.solved) || exercises[0]

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8">
      <section className="grid gap-6 border-2 border-line bg-card p-6 shadow-[8px_8px_0_0_var(--line)] md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="font-mono text-[12px] tracking-[0.18em] text-muted uppercase">Тренажёр запросов</p>
          <h1 className="mt-2 font-display text-6xl leading-[0.9] font-semibold tracking-tight">
            Соберите запрос
            <span className="italic"> и посмотрите, </span>
            как он режет таблицу
          </h1>
          <p className="mt-4 max-w-xl text-[18px]">
            Схема рядом с курсором, подсказки по настоящим столбцам, проверка на скрытых строках. Всё считается в браузере, SQLite, без аккаунта.
          </p>
        </div>
        <div className="flex flex-col justify-between gap-4 border-2 border-line bg-paper p-4">
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">Продолжить</p>
            <p className="mt-1 font-display text-4xl leading-none font-semibold">{last.title}</p>
            <p className="mt-2 text-muted">
              Решено {solved} из {exercises.length}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/exercise/${last.id}`} className={btnAmber}>
              Открыть
            </Link>
            <Link to="/sandbox" className={btnTeal}>
              Песочница
            </Link>
          </div>
        </div>
      </section>
      <section className="grid gap-3 md:grid-cols-2">
        {topics.map((topic) => {
          const list = exercises.filter((exercise) => exercise.topicId === topic.id)
          const done = list.filter((exercise) => progress[exercise.id]?.solved).length
          return (
            <Link key={topic.id} to={`/topic/${topic.id}`} className="border-2 border-line bg-card p-4 hover:bg-amber/15">
              <p className="font-mono text-[12px] text-amber">{topic.kicker}</p>
              <h2 className="font-display text-4xl leading-none font-semibold">{topic.title}</h2>
              <p className="mt-2">{topic.blurb}</p>
              <p className="mt-3 font-mono text-[12px] text-muted">
                {done}/{list.length}
                {' · '}
                {([1, 2, 3] as const)
                  .filter((level) => list.some((exercise) => exercise.level === level))
                  .map((level) => `${levelName[level]} ${list.filter((exercise) => exercise.level === level).length}`)
                  .join(' · ')}
              </p>
            </Link>
          )
        })}
      </section>
    </div>
  )
}

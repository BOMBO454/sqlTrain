import type { BatchEntry } from '../lib/sql/types.ts'
import type { Pipeline } from '../lib/viz/pipeline.ts'
import { DataTable } from './ResultView.tsx'

const KIND: Record<string, string> = {
  source: 'Источник',
  join: 'Соединение',
  where: 'Фильтр',
  group: 'Группы',
  having: 'Группы после HAVING',
  select: 'Проекция',
  order: 'Порядок',
}

export function VizPanel({
  pipeline,
  samples,
}: {
  pipeline: Pipeline | null
  samples: Record<string, BatchEntry> | null
}) {
  if (!pipeline) {
    return <p className="text-muted">Выполните запрос — справа появится, как он режет строки.</p>
  }
  if (!pipeline.supported) {
    return (
      <div className="space-y-2">
        <p>{pipeline.reason}</p>
        <ul className="list-disc pl-5 text-muted">
          {pipeline.outline.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <p className="text-[16px]">{pipeline.narrative}</p>
      <ol className="space-y-3">
        {pipeline.stages.map((stage, index) => {
          const sample = samples?.[`s${index}`]
          const count = sample && sample.ok ? sample.table.values.length : null
          return (
            <li key={`${stage.kind}-${index}`} className="border-2 border-line">
              <div className="border-b-2 border-line bg-paper px-3 py-2">
                <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
                  {index + 1}. {KIND[stage.kind] ?? stage.kind}
                  {count !== null ? ` · ${count}` : ''}
                </p>
                <p className="font-display text-2xl leading-none font-semibold">{stage.title}</p>
                <p className="mt-1 font-mono text-[12px] text-muted">{stage.detail}</p>
              </div>
              <div className="p-3">
                {!sample ? <p className="text-muted">Шаг ещё не посчитан.</p> : null}
                {sample && !sample.ok ? <p className="text-danger">{sample.error}</p> : null}
                {sample && sample.ok ? (
                  <DataTable
                    table={{
                      columns: sample.table.columns,
                      values: sample.table.values.slice(0, 8),
                    }}
                  />
                ) : null}
                {sample && sample.ok && sample.table.values.length > 8 ? (
                  <p className="mt-2 font-mono text-[11px] text-muted">Показаны 8 из {sample.table.values.length}</p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

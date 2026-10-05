import type { Grade } from '../lib/grade/compare.ts'
import { explainSqlError } from '../lib/sql/errors.ts'
import type { Cell, SqlTable } from '../lib/sql/types.ts'
import { btn } from './styles.ts'
import { tableToCsv } from '../lib/csv.ts'

export function ResultView({
  table,
  error,
  note,
  grade,
  rowsAffected,
}: {
  table: SqlTable | null
  error: string | null
  note: string | null
  grade: Grade | null
  rowsAffected: number | null
}) {
  if (error) {
    const explained = explainSqlError(error)
    return (
      <div className="space-y-2" role="alert">
        <p className="font-display text-2xl leading-tight text-danger">{explained.title}</p>
        {explained.hint ? <p>{explained.hint}</p> : null}
        {explained.title !== error ? <p className="font-mono text-[12px] text-muted">{error}</p> : null}
      </div>
    )
  }
  return (
    <div className="space-y-4">
      {grade ? <GradeBanner grade={grade} /> : null}
      {note ? <p>{note}</p> : null}
      {table && table.columns.length === 0 ? (
        <p>
          {rowsAffected && rowsAffected > 0
            ? `Команда выполнена, затронуто строк: ${rowsAffected}. Таблицы результата нет — так бывает у INSERT, UPDATE и DELETE.`
            : 'Команда выполнена. Результата-таблицы нет.'}
        </p>
      ) : null}
      {table && table.columns.length > 0 ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[12px] text-muted">
              {table.values.length === 0
                ? '0 строк. Запрос выполнился, фильтр никого не оставил.'
                : `${table.values.length} ${rowsLabel(table.values.length)}`}
            </p>
            <button
              type="button"
              className={btn}
              onClick={() => download('result.csv', tableToCsv(table))}
            >
              CSV
            </button>
          </div>
          <DataTable table={table} />
        </>
      ) : null}
      {grade && grade.status === 'mismatch' && (grade.missing.length > 0 || grade.extra.length > 0) ? (
        <div className="space-y-3">
          {grade.missing.length > 0 ? (
            <DiffBlock title="Не хватает таких строк" columns={grade.expectedColumns} rows={grade.missing} />
          ) : null}
          {grade.extra.length > 0 ? (
            <DiffBlock title="Лишние строки" columns={grade.actualColumns} rows={grade.extra} />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function GradeBanner({ grade }: { grade: Grade }) {
  if (grade.status === 'ok') {
    return (
      <p className="border-2 border-ok bg-ok/10 px-3 py-2" role="status">
        Сошлось и на учебных данных, и на скрытом наборе.
      </p>
    )
  }
  if (grade.status === 'almost') {
    return (
      <p className="border-2 border-amber bg-amber/15 px-3 py-2" role="status">
        Значения сходятся, имена столбцов нет. Нужны: {grade.expectedColumns.join(', ')}. Сейчас:{' '}
        {grade.actualColumns.join(', ')}.
      </p>
    )
  }
  return (
    <p className="border-2 border-danger bg-danger/10 px-3 py-2" role="status">
      {grade.message}
    </p>
  )
}

function DiffBlock({ title, columns, rows }: { title: string; columns: string[]; rows: Cell[][] }) {
  return (
    <div>
      <p className="mb-1 font-mono text-[11px] tracking-[0.14em] text-muted uppercase">{title}</p>
      <DataTable table={{ columns, values: rows }} />
    </div>
  )
}

export function DataTable({ table }: { table: SqlTable }) {
  return (
    <div className="overflow-auto border-2 border-line">
      <table className="w-full border-collapse font-mono text-[12px]">
        <thead className="bg-paper">
          <tr>
            {table.columns.map((column, index) => (
              <th key={`${column}-${index}`} className="border-b-2 border-line px-2 py-1.5 text-left font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.values.map((row, index) => (
            <tr key={index} className="odd:bg-paper/60">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border-b border-line/20 px-2 py-1 align-top whitespace-nowrap">
                  {cell === null ? <span className="text-muted">NULL</span> : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function rowsLabel(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'строка'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'строки'
  return 'строк'
}

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

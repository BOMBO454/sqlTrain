import type { SchemaTable } from '../lib/sql/types.ts'

export function SchemaCards({
  tables,
  error,
  onInsert,
}: {
  tables: SchemaTable[] | null
  error: string | null
  onInsert: (text: string) => void
}) {
  if (error) return <p className="text-danger">{error}</p>
  if (!tables) return <p className="text-muted">Схема собирается…</p>
  const links = tables.flatMap((table) =>
    table.foreignKeys.map((fk) => `${table.name}.${fk.from} → ${fk.table}.${fk.to}`),
  )
  return (
    <div className="space-y-3">
      {tables.map((table) => (
        <article key={table.name} className="border-2 border-line bg-paper">
          <button
            type="button"
            className="block w-full border-b-2 border-line px-3 py-2 text-left font-mono text-[13px] font-medium hover:bg-amber/30"
            onClick={() => onInsert(table.name)}
          >
            {table.name}
          </button>
          <ul>
            {table.columns.map((column) => (
              <li key={column.name} className="border-b border-line/20 last:border-b-0">
                <button
                  type="button"
                  className="flex w-full items-baseline justify-between gap-3 px-3 py-1.5 text-left font-mono text-[12px] hover:bg-amber/20"
                  onClick={() => onInsert(column.name)}
                >
                  <span>
                    {column.name}
                    {column.pk ? <span className="ml-2 text-amber">pk</span> : null}
                  </span>
                  <span className="text-muted">{column.type || '—'}</span>
                </button>
              </li>
            ))}
          </ul>
          <details className="border-t border-line/30 px-3 py-2">
            <summary className="cursor-pointer font-mono text-[11px] tracking-wide text-muted uppercase">
              Пример строк
            </summary>
            <div className="mt-2 overflow-auto">
              <MiniTable columns={table.preview.columns} values={table.preview.values} />
            </div>
          </details>
        </article>
      ))}
      {links.length > 0 ? (
        <div>
          <p className="mb-1 font-mono text-[11px] tracking-[0.14em] text-muted uppercase">Связи</p>
          <ul className="space-y-1 font-mono text-[12px]">
            {links.map((link) => (
              <li key={link}>{link}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

function MiniTable({ columns, values }: { columns: string[]; values: (string | number | null)[][] }) {
  if (columns.length === 0) return <p className="text-muted">Пусто</p>
  return (
    <table className="w-full border-collapse font-mono text-[11px]">
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={`${column}-${index}`} className="border-b border-line/40 px-1 py-1 text-left font-medium">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {values.map((row, index) => (
          <tr key={index}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="px-1 py-1 align-top whitespace-nowrap">
                {cell === null ? <span className="text-muted">NULL</span> : String(cell)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

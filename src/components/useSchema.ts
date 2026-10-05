import { useEffect, useState } from 'react'
import { loadSchema } from '../lib/sql/client.ts'
import type { SchemaTable } from '../lib/sql/types.ts'

export function useSchema(seedSql: string | null) {
  const [tables, setTables] = useState<SchemaTable[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!seedSql) return
    let cancel = false
    loadSchema(seedSql).then(
      (next) => {
        if (!cancel) setTables(next)
      },
      (reason: unknown) => {
        if (!cancel) setError(reason instanceof Error ? reason.message : 'Схема не загрузилась')
      },
    )
    return () => {
      cancel = true
    }
  }, [seedSql])

  return { tables, error }
}

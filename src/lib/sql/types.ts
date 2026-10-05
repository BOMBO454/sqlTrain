export type Cell = string | number | null

export type SqlTable = {
  columns: string[]
  values: Cell[][]
}

export type SchemaColumn = {
  name: string
  type: string
  pk: boolean
  notnull: boolean
}

export type ForeignKey = {
  from: string
  table: string
  to: string
}

export type SchemaTable = {
  name: string
  columns: SchemaColumn[]
  foreignKeys: ForeignKey[]
  preview: SqlTable
}

export type QueryOutcome = {
  table: SqlTable
  rowsAffected: number
}

export type BatchEntry =
  | { ok: true; table: SqlTable }
  | { ok: false; error: string }

export type SandboxOutcome = QueryOutcome & {
  snapshot: Uint8Array
  tables: SchemaTable[]
}

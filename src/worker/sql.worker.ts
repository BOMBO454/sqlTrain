import initSqlJs, { type Database, type SqlValue } from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url'
import type { Cell, QueryOutcome, SandboxOutcome, SchemaTable, SqlTable } from '../lib/sql/types.ts'

type BatchEntry = { ok: true; table: SqlTable } | { ok: false; error: string }

type Request =
  | { id: number; action: 'query'; seedSql: string; sql: string }
  | { id: number; action: 'batch'; seedSql: string; queries: { id: string; sql: string }[] }
  | { id: number; action: 'schema'; seedSql: string }
  | { id: number; action: 'sandbox'; seedSql: string; snapshot: Uint8Array | null; sql: string | null }

type Response =
  | { id: number; ok: true; action: 'query'; result: QueryOutcome }
  | { id: number; ok: true; action: 'batch'; tables: Record<string, BatchEntry> }
  | { id: number; ok: true; action: 'schema'; tables: SchemaTable[] }
  | { id: number; ok: true; action: 'sandbox'; result: SandboxOutcome }
  | { id: number; ok: false; error: string }

let sqlPromise: ReturnType<typeof initSqlJs> | null = null

function engine() {
  sqlPromise ??= initSqlJs({ locateFile: () => wasmUrl })
  return sqlPromise
}

let chain = Promise.resolve()

self.onmessage = (event: MessageEvent<Request>) => {
  const request = event.data
  chain = chain.then(() => handle(request)).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Сбой SQL'
    respond({ id: request.id, ok: false, error: message })
  })
}

async function handle(request: Request) {
  const SQL = await engine()
  if (request.action === 'schema') {
    const db = open(SQL, request.seedSql, null)
    try {
      respond({ id: request.id, ok: true, action: 'schema', tables: readSchema(db) })
    } finally {
      db.close()
    }
    return
  }
  if (request.action === 'query') {
    const db = open(SQL, request.seedSql, null)
    try {
      respond({
        id: request.id,
        ok: true,
        action: 'query',
        result: { table: execQuery(db, request.sql), rowsAffected: db.getRowsModified() },
      })
    } finally {
      db.close()
    }
    return
  }
  if (request.action === 'batch') {
    const db = open(SQL, request.seedSql, null)
    const tables: Record<string, BatchEntry> = {}
    try {
      for (const query of request.queries) {
        try {
          tables[query.id] = { ok: true, table: execQuery(db, query.sql) }
        } catch (error) {
          tables[query.id] = { ok: false, error: error instanceof Error ? error.message : 'Ошибка запроса' }
        }
      }
      respond({ id: request.id, ok: true, action: 'batch', tables })
    } finally {
      db.close()
    }
    return
  }
  const db = open(SQL, request.seedSql, request.snapshot)
  try {
    const result = request.sql ? runScript(db, request.sql) : { table: emptyTable(), rowsAffected: 0 }
    const snapshot = db.export()
    respond({
      id: request.id,
      ok: true,
      action: 'sandbox',
      result: { ...result, snapshot, tables: readSchema(db) },
    })
  } finally {
    db.close()
  }
}

function open(SQL: Awaited<ReturnType<typeof initSqlJs>>, seedSql: string, snapshot: Uint8Array | null) {
  if (snapshot && snapshot.byteLength > 0) return new SQL.Database(snapshot)
  const db = new SQL.Database()
  if (seedSql.trim()) db.run(seedSql)
  return db
}

function runScript(db: Database, sql: string): QueryOutcome {
  const results = db.exec(sql)
  const rowsAffected = db.getRowsModified()
  if (results.length > 0) {
    const last = results[results.length - 1]
    return {
      table: { columns: last.columns, values: last.values.map((row) => row.map(cell)) },
      rowsAffected,
    }
  }
  const stripped = sql.trim().replace(/;+\s*$/u, '')
  if (!stripped.includes(';') && /^(with|select)\b/iu.test(stripped)) {
    return { table: execQuery(db, stripped), rowsAffected }
  }
  return { table: emptyTable(), rowsAffected }
}

function execQuery(db: Database, sql: string): SqlTable {
  const stmt = db.prepare(sql)
  try {
    const columns = stmt.getColumnNames()
    const values: Cell[][] = []
    while (stmt.step()) values.push(stmt.get().map(cell))
    return { columns, values }
  } finally {
    stmt.free()
  }
}

function readSchema(db: Database): SchemaTable[] {
  const names = execQuery(
    db,
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  )
  return names.values.map((row) => {
    const name = String(row[0])
    const info = execQuery(db, `PRAGMA table_info(${quote(name)})`)
    const fks = execQuery(db, `PRAGMA foreign_key_list(${quote(name)})`)
    const preview = execQuery(db, `SELECT * FROM ${quote(name)} LIMIT 5`)
    return {
      name,
      columns: info.values.map((column) => ({
        name: String(column[1]),
        type: String(column[2] ?? ''),
        notnull: column[3] === 1,
        pk: column[5] === 1,
      })),
      foreignKeys: fks.values.map((fk) => ({
        from: String(fk[3]),
        table: String(fk[2]),
        to: String(fk[4]),
      })),
      preview,
    }
  })
}

function quote(name: string): string {
  return `"${name.replaceAll('"', '""')}"`
}

function cell(value: SqlValue): Cell {
  if (value === null || value === undefined) return null
  if (typeof value === 'number' || typeof value === 'string') return value
  if (typeof value === 'bigint') return Number(value)
  return null
}

function emptyTable(): SqlTable {
  return { columns: [], values: [] }
}

function respond(message: Response) {
  self.postMessage(message)
}

import type { BatchEntry, QueryOutcome, SandboxOutcome, SchemaTable } from './types.ts'

type Response =
  | { id: number; ok: true; action: 'query'; result: QueryOutcome }
  | { id: number; ok: true; action: 'batch'; tables: Record<string, BatchEntry> }
  | { id: number; ok: true; action: 'schema'; tables: SchemaTable[] }
  | { id: number; ok: true; action: 'sandbox'; result: SandboxOutcome }
  | { id: number; ok: false; error: string }

let worker: Worker | null = null
let nextId = 1
const pending = new Map<number, { resolve: (value: Response) => void; reject: (error: Error) => void }>()

function getWorker() {
  if (worker) return worker
  worker = new Worker(new URL('../../worker/sql.worker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = (event: MessageEvent<Response>) => {
    const wait = pending.get(event.data.id)
    if (!wait) return
    pending.delete(event.data.id)
    if (event.data.ok) wait.resolve(event.data)
    else wait.reject(new Error(event.data.error))
  }
  worker.onerror = (event) => {
    for (const wait of pending.values()) wait.reject(new Error(event.message || 'Сбой SQL-воркера'))
    pending.clear()
  }
  return worker
}

function call(body: Record<string, unknown>): Promise<Response> {
  const id = nextId
  nextId += 1
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id)
      reject(new Error('SQL не ответил вовремя. Обновите страницу.'))
    }, 20000)
    pending.set(id, {
      resolve: (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      reject: (error) => {
        clearTimeout(timer)
        reject(error)
      },
    })
    getWorker().postMessage({ ...body, id })
  })
}

export async function runSeeded(seedSql: string, sql: string): Promise<QueryOutcome> {
  const response = await call({ action: 'query', seedSql, sql })
  if (response.ok && response.action === 'query') return response.result
  throw new Error('Неожиданный ответ SQL')
}

export async function runBatch(seedSql: string, queries: { id: string; sql: string }[]) {
  const response = await call({ action: 'batch', seedSql, queries })
  if (response.ok && response.action === 'batch') return response.tables
  throw new Error('Неожиданный ответ SQL')
}

export async function loadSchema(seedSql: string): Promise<SchemaTable[]> {
  const response = await call({ action: 'schema', seedSql })
  if (response.ok && response.action === 'schema') return response.tables
  throw new Error('Неожиданный ответ SQL')
}

export async function runSandbox(
  seedSql: string,
  snapshot: Uint8Array | null,
  sql: string | null,
): Promise<SandboxOutcome> {
  const response = await call({ action: 'sandbox', seedSql, snapshot, sql })
  if (response.ok && response.action === 'sandbox') return response.result
  throw new Error('Неожиданный ответ SQL')
}

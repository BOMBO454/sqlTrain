import { openDB, type IDBPDatabase } from 'idb'

export type Progress = {
  solved: boolean
  attempts: number
  hintsUsed: number
  solutionSeen: boolean
  updatedAt: number
}

export type SandboxState = {
  snapshot: ArrayBuffer | null
  history: { sql: string; at: number }[]
}

type Stores = {
  drafts: { key: string; value: { sql: string; updatedAt: number } }
  progress: { key: string; value: Progress }
  sandbox: { key: string; value: SandboxState }
}

let database: Promise<IDBPDatabase<Stores>> | null = null

function db() {
  database ??= openDB<Stores>('verstak', 1, {
    upgrade(store) {
      store.createObjectStore('drafts')
      store.createObjectStore('progress')
      store.createObjectStore('sandbox')
    },
  })
  return database
}

export async function readDraft(exerciseId: string): Promise<string | null> {
  const row = await (await db()).get('drafts', exerciseId)
  return row?.sql ?? null
}

export async function writeDraft(exerciseId: string, sql: string): Promise<void> {
  await (await db()).put('drafts', { sql, updatedAt: Date.now() }, exerciseId)
}

const PROGRESS_KEY = 'verstak-progress'

let progressQueue: Promise<unknown> = Promise.resolve()

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = progressQueue.then(task, task)
  progressQueue = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

async function readProgressFromIndexedDb(): Promise<Record<string, Progress>> {
  if (typeof indexedDB === 'undefined') return {}
  const store = await db()
  const keys = await store.getAllKeys('progress')
  const rows = await store.getAll('progress')
  const map: Record<string, Progress> = {}
  keys.forEach((key, index) => {
    const row = rows[index]
    if (isProgress(row)) map[String(key)] = row
  })
  return map
}

function isProgress(value: unknown): value is Progress {
  if (!value || typeof value !== 'object') return false
  const row = value as Partial<Progress>
  return (
    typeof row.solved === 'boolean' &&
    typeof row.attempts === 'number' &&
    typeof row.hintsUsed === 'number' &&
    typeof row.solutionSeen === 'boolean' &&
    typeof row.updatedAt === 'number'
  )
}

function readProgressMap(): Record<string, Progress> {
  const raw = localStorage.getItem(PROGRESS_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const map: Record<string, Progress> = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (isProgress(value)) map[key] = value
    }
    return map
  } catch {
    return {}
  }
}

async function ensureProgressStore(): Promise<void> {
  if (localStorage.getItem(PROGRESS_KEY) !== null) return
  let imported: Record<string, Progress> = {}
  try {
    imported = await readProgressFromIndexedDb()
  } catch {
    imported = {}
  }
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(imported))
}

export function readProgress(): Promise<Record<string, Progress>> {
  return enqueue(async () => {
    await ensureProgressStore()
    return readProgressMap()
  })
}

export function writeProgress(exerciseId: string, progress: Progress): Promise<void> {
  return enqueue(async () => {
    await ensureProgressStore()
    const map = readProgressMap()
    map[exerciseId] = progress
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(map))
  })
}

export async function readSandbox(datasetId: string): Promise<SandboxState | null> {
  return (await (await db()).get('sandbox', datasetId)) ?? null
}

export async function writeSandbox(datasetId: string, state: SandboxState): Promise<void> {
  await (await db()).put('sandbox', state, datasetId)
}

export async function clearSandbox(datasetId: string): Promise<void> {
  await (await db()).delete('sandbox', datasetId)
}

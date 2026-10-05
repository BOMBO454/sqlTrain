import { afterEach, describe, expect, it, vi } from 'vitest'
import { readProgress, writeProgress } from './storage.ts'

describe('прогресс', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('запоминает решённое задание в localStorage', async () => {
    const memory = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value)
      },
    })
    vi.stubGlobal('indexedDB', undefined)
    await writeProgress('select-names', {
      solved: true,
      attempts: 2,
      hintsUsed: 1,
      solutionSeen: false,
      updatedAt: 10,
    })
    const saved = await readProgress()
    expect(saved['select-names']?.solved).toBe(true)
    expect(memory.get('verstak-progress')).toContain('"select-names"')
  })
})
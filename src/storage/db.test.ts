import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { putSession, getSession, listSessions, _resetDbForTesting } from './db'
import type { Session } from '../lib/types'

function makeSession(id: string, startedAt: number): Session {
  return {
    id,
    startedAt,
    completedAt: null,
    protocolVersion: '0.1.0',
    drillId: 'd2-gabor',
    trials: [],
    eyeStrainScore: null,
  }
}

beforeEach(() => {
  // Give each test a fresh IDB instance and clear the cached connection.
  globalThis.indexedDB = new IDBFactory()
  _resetDbForTesting()
})

describe('db', () => {
  it('putSession and getSession round-trip', async () => {
    const session = makeSession('abc', Date.now())
    await putSession(session)
    const retrieved = await getSession('abc')
    expect(retrieved).toEqual(session)
  })

  it('getSession returns undefined for missing id', async () => {
    const retrieved = await getSession('nonexistent')
    expect(retrieved).toBeUndefined()
  })

  it('listSessions returns sessions ordered by startedAt', async () => {
    const a = makeSession('a', 1000)
    const b = makeSession('b', 2000)
    const c = makeSession('c', 3000)
    await putSession(c)
    await putSession(a)
    await putSession(b)
    const list = await listSessions()
    expect(list.map((s) => s.id)).toEqual(['a', 'b', 'c'])
  })

  it('putSession overwrites existing session', async () => {
    const original = makeSession('x', 1000)
    await putSession(original)
    const updated: Session = { ...original, completedAt: 9999, eyeStrainScore: 3 }
    await putSession(updated)
    const retrieved = await getSession('x')
    expect(retrieved?.completedAt).toBe(9999)
    expect(retrieved?.eyeStrainScore).toBe(3)
  })
})

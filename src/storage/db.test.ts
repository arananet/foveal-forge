import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { putSession, getSession, listSessions, putBaseline, getBaseline, _resetDbForTesting } from './db'
import type { SessionResult, BaselineData } from '../lib/types'

function makeSession(id: string, startedAt: number): SessionResult {
  return {
    id,
    startedAt,
    completedAt: null,
    protocolVersion: '0.1.0',
    eyeStrainScore: null,
  }
}

function makeBaseline(): BaselineData {
  return {
    completedAt: 1000,
    age: 52,
    correction: 'glasses',
    knownConditions: '',
    contrastThreshold: 0.15,
    readingSpeedWpm: 180,
  }
}

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
  _resetDbForTesting()
})

describe('sessions', () => {
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
    const updated: SessionResult = { ...original, completedAt: 9999, eyeStrainScore: 3 }
    await putSession(updated)
    const retrieved = await getSession('x')
    expect(retrieved?.completedAt).toBe(9999)
    expect(retrieved?.eyeStrainScore).toBe(3)
  })
})

describe('baseline', () => {
  it('returns undefined before baseline is set', async () => {
    expect(await getBaseline()).toBeUndefined()
  })

  it('putBaseline and getBaseline round-trip', async () => {
    const data = makeBaseline()
    await putBaseline(data)
    expect(await getBaseline()).toEqual(data)
  })

  it('putBaseline overwrites previous baseline', async () => {
    await putBaseline(makeBaseline())
    const updated: BaselineData = { ...makeBaseline(), age: 60, readingSpeedWpm: 220 }
    await putBaseline(updated)
    const retrieved = await getBaseline()
    expect(retrieved?.age).toBe(60)
    expect(retrieved?.readingSpeedWpm).toBe(220)
  })
})

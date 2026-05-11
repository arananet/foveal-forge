import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { SessionResult, BaselineData } from '../lib/types'

type BaselineRecord = BaselineData & { _key: string }

interface FovealDB extends DBSchema {
  sessions: {
    key: string
    value: SessionResult
    indexes: { byStartedAt: number }
  }
  baseline: {
    key: string
    value: BaselineRecord
  }
}

const DB_NAME = 'foveal-forge'
const DB_VERSION = 2

let dbPromise: Promise<IDBPDatabase<FovealDB>> | null = null

function getDb(): Promise<IDBPDatabase<FovealDB>> {
  if (!dbPromise) {
    dbPromise = openDB<FovealDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore('sessions', { keyPath: 'id' })
          store.createIndex('byStartedAt', 'startedAt')
        }
        if (oldVersion < 2) {
          db.createObjectStore('baseline', { keyPath: '_key' })
        }
      },
    })
  }
  return dbPromise
}

export async function putSession(session: SessionResult): Promise<void> {
  const db = await getDb()
  await db.put('sessions', session)
}

export async function getSession(id: string): Promise<SessionResult | undefined> {
  const db = await getDb()
  return db.get('sessions', id)
}

export async function listSessions(): Promise<SessionResult[]> {
  const db = await getDb()
  return db.getAllFromIndex('sessions', 'byStartedAt')
}

export async function putBaseline(data: BaselineData): Promise<void> {
  const db = await getDb()
  await db.put('baseline', { ...data, _key: 'singleton' })
}

export async function getBaseline(): Promise<BaselineData | undefined> {
  const db = await getDb()
  const record = await db.get('baseline', 'singleton')
  if (!record) return undefined
  return {
    completedAt: record.completedAt,
    age: record.age,
    correction: record.correction,
    knownConditions: record.knownConditions,
    contrastThreshold: record.contrastThreshold,
    readingSpeedWpm: record.readingSpeedWpm,
  }
}

export function _resetDbForTesting(): void {
  dbPromise = null
}

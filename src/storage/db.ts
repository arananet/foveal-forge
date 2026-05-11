import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Session } from '../lib/types'

interface FovealDB extends DBSchema {
  sessions: {
    key: string
    value: Session
    indexes: { byStartedAt: number }
  }
}

const DB_NAME = 'foveal-forge'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<FovealDB>> | null = null

function getDb(): Promise<IDBPDatabase<FovealDB>> {
  if (!dbPromise) {
    dbPromise = openDB<FovealDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('sessions', { keyPath: 'id' })
        store.createIndex('byStartedAt', 'startedAt')
      },
    })
  }
  return dbPromise
}

export async function putSession(session: Session): Promise<void> {
  const db = await getDb()
  await db.put('sessions', session)
}

export async function getSession(id: string): Promise<Session | undefined> {
  const db = await getDb()
  return db.get('sessions', id)
}

export async function listSessions(): Promise<Session[]> {
  const db = await getDb()
  return db.getAllFromIndex('sessions', 'byStartedAt')
}

// Reset the cached db connection (used in tests with fake-indexeddb).
export function _resetDbForTesting(): void {
  dbPromise = null
}

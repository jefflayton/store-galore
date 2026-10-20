import { drizzle } from 'drizzle-orm/d1'

import { relations } from './relations'
import * as schema from './schema'

export const createDb = (d1: D1Database) => drizzle(d1, { relations })

export type Db = ReturnType<typeof createDb>

export { schema }

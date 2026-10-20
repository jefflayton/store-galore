import { Hono } from 'hono'

import { createDb, schema } from './db'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.get('/', (c) => {
    const data = {
        hello: 'world',
    }

    return c.json(data)
})

app.get('/towns', async (c) => {
    const db = createDb(c.env.DB)
    const towns = await db.select().from(schema.towns)

    return c.json(towns)
})

export default app

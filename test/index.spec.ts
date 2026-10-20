import { env, exports } from 'cloudflare:workers'
import { describe, it, expect } from 'vitest'

import { createDb, schema } from '../src/db'

describe('worker', () => {
    it('responds on /', async () => {
        const response = await exports.default.fetch('https://example.com/')
        expect(await response.json()).toEqual({ hello: 'world' })
    })

    it('lists towns from D1', async () => {
        const db = createDb(env.DB)
        await db.insert(schema.towns).values({ guildId: 'guild-1', gridWidth: 10, gridHeight: 10 })

        const response = await exports.default.fetch('https://example.com/towns')
        const towns = await response.json()

        expect(towns).toEqual([
            expect.objectContaining({
                guildId: 'guild-1',
                resetHour: 6,
                settings: {},
            }),
        ])
    })

    it('loads players with their town via relational queries', async () => {
        const db = createDb(env.DB)
        const [town] = await db
            .insert(schema.towns)
            .values({ guildId: 'guild-2', gridWidth: 10, gridHeight: 10 })
            .returning()
        await db.insert(schema.players).values({ townId: town.id, discordUserId: 'user-1' })

        const result = await db.query.towns.findFirst({
            where: { guildId: 'guild-2' },
            with: { players: true },
        })

        expect(result?.players).toEqual([expect.objectContaining({ discordUserId: 'user-1', coins: 0 })])
    })
})

import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

const createdAt = () =>
    integer('created_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(unixepoch())`)

export const towns = sqliteTable('towns', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    guildId: text('guild_id').notNull().unique(),
    gridWidth: integer('grid_width').notNull(),
    gridHeight: integer('grid_height').notNull(),
    resetHour: integer('reset_hour').notNull().default(6),
    timezone: text('timezone').notNull().default('UTC'),
    digestChannelId: text('digest_channel_id'),
    currentSeason: text('current_season'),
    settings: text('settings', { mode: 'json' }).$type<Record<string, unknown>>().notNull().default({}),
    createdAt: createdAt(),
})

export const players = sqliteTable(
    'players',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        townId: integer('town_id')
            .notNull()
            .references(() => towns.id),
        discordUserId: text('discord_user_id').notNull(),
        coins: integer('coins').notNull().default(0),
        xp: integer('xp').notNull().default(0),
        lastCheckinAt: integer('last_checkin_at', { mode: 'timestamp' }),
        lastVisitAt: integer('last_visit_at', { mode: 'timestamp' }),
        createdAt: createdAt(),
    },
    (t) => [uniqueIndex('players_town_user_idx').on(t.townId, t.discordUserId)]
)

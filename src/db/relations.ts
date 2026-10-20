import { defineRelations } from 'drizzle-orm'

import * as schema from './schema'

export const relations = defineRelations(schema, (r) => ({
    towns: {
        players: r.many.players(),
    },
    players: {
        town: r.one.towns({ from: r.players.townId, to: r.towns.id }),
    },
}))

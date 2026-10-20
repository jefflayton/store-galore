import { InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions'
import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'

interface InteractionRequest {
    type: InteractionType
    data: {
        name: string
    }
}

const app = new Hono<{
    Bindings: CloudflareBindings
    Variables: { interaction: InteractionRequest }
}>()

const verifyKeyMiddleware = createMiddleware(async (c, next) => {
    const ts = c.req.header('X-Signature-Timestamp')
    const sig = c.req.header('X-Signature-Ed25519')

    if (!ts || !sig) {
        return c.text('Invalid signature', 401)
    }

    const raw = await c.req.text()
    console.log(c.env.DISCORD_PUBLIC_KEY)
    const isValid = await verifyKey(raw, sig, ts, c.env.DISCORD_PUBLIC_KEY)
    if (!isValid) {
        return c.text('Bad request signature', 401)
    }

    const body = JSON.parse(raw) || {}
    c.set('interaction', body)
    if (body.type === InteractionType.PING) {
        return c.json({ type: InteractionResponseType.PONG })
    }

    await next()
})

app.use('*', verifyKeyMiddleware)

app.post('/', async (c) => {
    const body = c.get('interaction')
    if (body.type === InteractionType.APPLICATION_COMMAND && body.data.name === 'ping') {
        return c.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: 'pong' },
        })
    }

    return c.json({ error: 'Bad request' }, 400)
})

export default app

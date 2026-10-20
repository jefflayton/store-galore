import { defineConfig } from 'drizzle-kit'

// Drizzle Kit only generates SQL here. Wrangler applies it to D1:
// `wrangler d1 migrations apply DB --local` (or --remote).
export default defineConfig({
    dialect: 'sqlite',
    schema: './src/db/schema.ts',
    out: './drizzle',
})

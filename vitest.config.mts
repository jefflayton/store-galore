import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    plugins: [
        cloudflareTest(async () => ({
            wrangler: { configPath: './wrangler.jsonc' },
            miniflare: {
                // Applied by test/apply-migrations.ts. Rows persist between tests in a file, so use unique keys.
                bindings: {
                    TEST_MIGRATIONS: await readD1Migrations({
                        migrationsDir: 'drizzle',
                        migrationsPattern: 'drizzle/*/migration.sql',
                    }),
                },
            },
        })),
    ],
    test: {
        setupFiles: ['./test/apply-migrations.ts'],
    },
})

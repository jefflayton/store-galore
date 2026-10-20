import { defineConfig } from 'oxfmt'

export default defineConfig({
    printWidth: 120,
    tabWidth: 4,
    useTabs: false,
    semi: false,
    trailingComma: 'es5',
    singleQuote: true,
    sortImports: true,
    overrides: [
        {
            files: ['*.yml', '*.yaml'],
            options: {
                tabWidth: 2,
            },
        },
    ],
})

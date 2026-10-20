import { defineConfig } from 'oxlint'

export default defineConfig({
    options: {
        typeAware: true,
        typeCheck: true,
    },
    categories: {
        correctness: 'warn',
    },
    rules: {
        'eslint/no-unused-vars': 'error',
    },
})

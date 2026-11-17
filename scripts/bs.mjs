import fs from 'node:fs/promises'
import path from 'node:path'

export const API_BASE = 'https://api-cloud.browserstack.com'

export function fail (message) {
    console.error(`✖ ${message}`)
    process.exit(1)
}

/**
 * Lê as credenciais do BrowserStack a partir das variáveis de ambiente.
 * Funciona tanto localmente (.env) quanto no GitHub Actions (secrets).
 */
export function bsEnv () {
    const username = process.env.BROWSERSTACK_USERNAME
    const accessKey = process.env.BROWSERSTACK_ACCESS_KEY

    if (!username || !accessKey) {
        fail('Defina BROWSERSTACK_USERNAME e BROWSERSTACK_ACCESS_KEY (no .env ou como secrets do repositório).')
    }

    return {
        username,
        accessKey,
        apiBase: API_BASE,
        auth: `Basic ${Buffer.from(`${username}:${accessKey}`).toString('base64')}`
    }
}

export async function request (url, options = {}) {
    const response = await fetch(url, options)

    if (!response.ok) {
        const body = await response.text().catch(() => '')
        const error = new Error(
            `${options.method || 'GET'} ${url} -> ${response.status} ${response.statusText} ${body.slice(0, 300)}`
        )
        error.status = response.status
        throw error
    }

    return response
}

export const sessionFilePath = () => path.resolve(
    process.env.BROWSERSTACK_SESSION_FILE || path.join('.browserstack', 'session-id.txt')
)

export const artifactsDir = () => path.resolve(
    process.env.BROWSERSTACK_ARTIFACTS_DIR || 'browserstack-artifacts'
)

export function sessionUrl (sessionId, details) {
    return details?.public_url || `https://app-automate.browserstack.com/dashboard/v2/sessions/${sessionId}`
}

/** Escreve no resumo do job do GitHub Actions, quando disponível. */
export async function appendSummary (lines) {
    const summaryFile = process.env.GITHUB_STEP_SUMMARY
    if (!summaryFile) return

    try {
        await fs.appendFile(summaryFile, `${lines.join('\n')}\n`, 'utf8')
    } catch (error) {
        console.warn(`Não foi possível escrever no resumo do job: ${error.message}`)
    }
}

export function formatBytes (bytes) {
    if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${(bytes / 1024).toFixed(0)} KB`
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

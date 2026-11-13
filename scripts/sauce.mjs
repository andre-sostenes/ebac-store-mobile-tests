import fs from 'node:fs/promises'

export const API_BY_REGION = {
    'us-west-1': 'https://api.us-west-1.saucelabs.com',
    'eu-central-1': 'https://api.eu-central-1.saucelabs.com'
}

export function fail (message) {
    console.error(`✖ ${message}`)
    process.exit(1)
}

/**
 * Lê as credenciais e a região do SauceLabs a partir das variáveis de ambiente.
 * Funciona tanto localmente (.env) quanto no GitHub Actions (secrets).
 */
export function sauceEnv () {
    const username = process.env.SAUCE_USERNAME
    const accessKey = process.env.SAUCE_ACCESS_KEY

    if (!username || !accessKey) {
        fail('Defina SAUCE_USERNAME e SAUCE_ACCESS_KEY (no .env ou como secrets do repositório).')
    }

    const region = process.env.SAUCE_REGION || 'us-west-1'
    const apiBase = API_BY_REGION[region]

    if (!apiBase) {
        fail(`SAUCE_REGION inválida: "${region}". Use us-west-1 ou eu-central-1.`)
    }

    return {
        username,
        accessKey,
        region,
        apiBase,
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

export function jobUrl (sessionId) {
    return `https://app.saucelabs.com/tests/${sessionId}`
}

/**
 * Escreve no resumo do job do GitHub Actions, quando disponível.
 */
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

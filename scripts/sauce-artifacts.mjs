import fs from 'node:fs/promises'
import path from 'node:path'
import { sauceEnv, request, jobUrl, appendSummary, sleep, formatBytes } from './sauce.mjs'

/**
 * Baixa o vídeo, os logs e os screenshots da sessão executada no SauceLabs
 * e publica o link do job no resumo do GitHub Actions.
 *
 * Uso:
 *   node scripts/sauce-artifacts.mjs [session-id]
 *
 * Sem argumento, lê o ID salvo pelo hook afterSession em .sauce/session-id.txt.
 */
const attempts = Number(process.env.SAUCE_ARTIFACTS_ATTEMPTS || 6)
const delayMs = Number(process.env.SAUCE_ARTIFACTS_DELAY_MS || 10000)

const sessionFile = path.resolve(process.env.SAUCE_SESSION_FILE || path.join('.sauce', 'session-id.txt'))
const outputDir = path.resolve(process.env.SAUCE_ARTIFACTS_DIR || 'sauce-artifacts')

const sessionId = process.argv[2] || (await fs.readFile(sessionFile, 'utf8').catch(() => '')).trim()

if (!sessionId) {
    console.warn('⚠ Nenhuma sessão do SauceLabs encontrada; pulando coleta de artefatos.')
    process.exit(0)
}

const env = sauceEnv()
const headers = { Authorization: env.auth }
const jobApi = `${env.apiBase}/rest/v1/${env.username}/jobs/${sessionId}`
const link = jobUrl(sessionId)

await fs.mkdir(outputDir, { recursive: true })
console.log(`Job do SauceLabs: ${link}`)

let details = null
try {
    details = await (await request(jobApi, { headers })).json()
} catch (error) {
    console.warn(`⚠ Não foi possível consultar os detalhes do job: ${error.message}`)
}

async function download (url, filePath, { tries = 1, useAuth = true } = {}) {
    const name = path.basename(filePath)

    for (let attempt = 1; attempt <= tries; attempt++) {
        try {
            const response = await fetch(url, useAuth ? { headers } : {})

            if (response.status === 404) throw new Error('ainda não disponível (404)')
            if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)

            const buffer = Buffer.from(await response.arrayBuffer())
            if (!buffer.length) throw new Error('arquivo vazio')

            await fs.writeFile(filePath, buffer)
            console.log(`✔ ${name} (${formatBytes(buffer.length)})`)
            return buffer.length
        } catch (error) {
            if (attempt === tries) {
                console.warn(`⚠ Não foi possível baixar ${name}: ${error.message}`)
                return 0
            }

            console.log(`… ${name} indisponível (${error.message}); nova tentativa em ${delayMs / 1000}s`)
            await sleep(delayMs)
        }
    }

    return 0
}

const videoPath = path.join(outputDir, 'video.mp4')
let videoBytes = await download(`${jobApi}/assets/video.mp4`, videoPath, { tries: attempts })

if (!videoBytes && details && details.video_url) {
    videoBytes = await download(details.video_url, videoPath, { tries: 3, useAuth: false })
}

await download(`${jobApi}/assets/log.json`, path.join(outputDir, 'log.json'), { tries: 2 })
await download(`${jobApi}/assets/screenshots.zip`, path.join(outputDir, 'screenshots.zip'), { tries: 1 })

const status = details
    ? (details.consolidated_status || (details.passed ? 'passed' : 'failed'))
    : 'desconhecido'
const device = details ? `${details.os || 'iOS'} - ${details.device || 'device'}` : 'não informado'

const summary = [
    '### SauceLabs — iOS',
    '',
    `- **Job:** ${link}`,
    `- **Status:** ${status}`,
    `- **Device:** ${device}`
]

if (videoBytes) {
    summary.push(`- **Vídeo:** \`sauce-artifacts/video.mp4\` (${formatBytes(videoBytes)}) — também disponível em **Artifacts** no GitHub Actions`)
} else {
    summary.push('- **Vídeo:** não foi possível baixar automaticamente; use o link do job acima')
}

await appendSummary(summary)

console.log('')
console.log(`Status: ${status}`)
console.log(`Vídeo: ${videoBytes ? path.relative(process.cwd(), videoPath) : 'indisponível'}`)
console.log(`Job: ${link}`)

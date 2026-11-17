import fs from 'node:fs/promises'
import path from 'node:path'
import { bsEnv, request, sessionFilePath, artifactsDir, sessionUrl, appendSummary, sleep, formatBytes } from './bs.mjs'

/**
 * Baixa o vídeo, os logs e os screenshots da sessão executada no
 * BrowserStack App Automate e publica o link no resumo do GitHub Actions.
 *
 * Uso:
 *   node scripts/bs-artifacts.mjs [session-id]
 *
 * Sem argumento, lê o ID salvo pelo hook `before` em .browserstack/session-id.txt.
 */
const attempts = Number(process.env.BS_ARTIFACTS_ATTEMPTS || 8)
const delayMs = Number(process.env.BS_ARTIFACTS_DELAY_MS || 10000)

const outputDir = artifactsDir()
const sessionId = process.argv[2] || (await fs.readFile(sessionFilePath(), 'utf8').catch(() => '')).trim()

if (!sessionId) {
    console.warn('⚠ Nenhuma sessão do BrowserStack encontrada; pulando coleta de artefatos.')
    process.exit(0)
}

const env = bsEnv()
const headers = { Authorization: env.auth }
const detailsApi = `${env.apiBase}/app-automate/sessions/${sessionId}.json`

await fs.mkdir(outputDir, { recursive: true })

let session = null
let link = sessionUrl(sessionId)
const videoUrlFromApi = () => session?.video_url || session?.video_url_s3 || null

for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
        const payload = await (await request(detailsApi, { headers })).json()
        session = payload.automation_session || payload
        link = sessionUrl(sessionId, session)

        if (videoUrlFromApi()) break
        console.log(`… detalhes da sessão obtidos, aguardando o vídeo (${attempt}/${attempts})`)
    } catch (error) {
        console.warn(`⚠ Não foi possível consultar a sessão: ${error.message}`)
    }

    if (attempt === attempts) break
    await sleep(delayMs)
}

console.log(`Sessão BrowserStack: ${link}`)

async function download (url, filePath, { tries = 1, useAuth = true } = {}) {
    if (!url || typeof url !== 'string') return 0

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
let videoBytes = await download(videoUrlFromApi(), videoPath, { tries: attempts, useAuth: false })

await download(session?.appium_logs_url, path.join(outputDir, 'appium-logs.txt'), { tries: 2 })
await download(session?.device_logs_url, path.join(outputDir, 'device-logs.txt'), { tries: 2 })

const rawLogs = session?.logs?.raw || session?.logs
if (typeof rawLogs === 'string') {
    await download(rawLogs, path.join(outputDir, 'log.html'), { tries: 2 })
}

const screenshots = Array.isArray(session?.screenshots) ? session.screenshots : []
for (const [index, screenshot] of screenshots.entries()) {
    const url = typeof screenshot === 'string' ? screenshot : screenshot?.url
    await download(url, path.join(outputDir, `screenshot-${index + 1}.png`))
}

const status = session?.browserstack_status || session?.status || 'desconhecido'
const device = [session?.device, session?.os_version].filter(Boolean).join(' / ') || 'não informado'

const summary = [
    '### BrowserStack App Automate — iOS',
    '',
    `- **Sessão:** ${link}`,
    `- **Status:** ${status}`,
    `- **Device:** ${device}`,
    `- **Build:** ${session?.build_name || 'não informado'}`
]

if (videoBytes) {
    summary.push(`- **Vídeo:** \`browserstack-artifacts/video.mp4\` (${formatBytes(videoBytes)}) — também disponível em **Artifacts** no GitHub Actions`)
} else {
    summary.push('- **Vídeo:** não foi possível baixar automaticamente; use o link da sessão acima')
}

await appendSummary(summary)

console.log('')
console.log(`Status: ${status}`)
console.log(`Vídeo: ${videoBytes ? path.relative(process.cwd(), videoPath) : 'indisponível'}`)
console.log(`Sessão: ${link}`)

import fs from 'node:fs/promises'
import path from 'node:path'
import { sauceEnv, request, fail, formatBytes, appendSummary } from './sauce.mjs'

/**
 * Envia o app (.zip para simulador ou .ipa para device real) para o
 * Sauce Storage e imprime o valor a ser usado na capability appium:app.
 *
 * Uso:
 *   node scripts/sauce-upload.mjs [caminho-do-app]
 */
const appPath = path.resolve(process.argv[2] || path.join('app', 'LojaEBAC-sim.zip'))

let stats
try {
    stats = await fs.stat(appPath)
} catch {
    fail(`App não encontrado em "${appPath}". Baixe o build antes de enviar (veja o README).`)
}

const env = sauceEnv()
const fileName = process.env.SAUCE_STORAGE_NAME || path.basename(appPath)
const storage = `storage:filename=${fileName}`
const uploadUrl = `${env.apiBase}/v1/storage/upload`

console.log(`Enviando ${fileName} (${formatBytes(stats.size)}) para o Sauce Storage (${env.region})...`)

const body = await fs.readFile(appPath)

// A API atual (File Storage API) recebe multipart/form-data.
// O endpoint antigo POST /rest/v1/storage/{usuario}/{arquivo} foi descontinuado.
const form = new FormData()
form.append('payload', new Blob([body]), fileName)
form.append('name', fileName)
form.append('description', 'EBAC Store - iOS checkout tests')

const response = await request(uploadUrl, {
    method: 'POST',
    headers: {
        Authorization: env.auth
    },
    body: form
})

const uploaded = await response.json().catch(() => ({}))

console.log('✔ Upload concluído')
console.log(`  Arquivo: ${fileName}`)
console.log(`  Capability: appium:app=${storage}`)
if (uploaded.item && uploaded.item.id) {
    console.log(`  ID no storage: ${uploaded.item.id}`)
}
if (uploaded.item && uploaded.item.metadata) {
    const meta = uploaded.item.metadata
    console.log(`  Build: ${meta.is_simulator ? 'simulador' : 'device real'} | min_os: ${meta.min_os ?? '?'} | target_os: ${meta.target_os ?? '?'}`)
}

await appendSummary([
    '### App enviada para o Sauce Storage',
    '',
    `- Arquivo: \`${fileName}\` (${formatBytes(stats.size)})`,
    `- Capability: \`appium:app=${storage}\``
])

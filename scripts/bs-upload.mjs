import fs from 'node:fs/promises'
import path from 'node:path'
import { bsEnv, request, fail, formatBytes, appendSummary } from './bs.mjs'

/**
 * Envia o app (.ipa para device real) para o BrowserStack App Automate e
 * imprime o valor de BROWSERSTACK_APP_URL (bs://...) usado nas capabilities.
 *
 * Uso:
 *   node scripts/bs-upload.mjs [caminho-do-app]
 */
const appPath = path.resolve(process.argv[2] || path.join('app', 'LojaEBAC.ipa'))

let stats
try {
    stats = await fs.stat(appPath)
} catch {
    fail(`App não encontrado em "${appPath}". Baixe o build antes de enviar (veja o README).`)
}

const env = bsEnv()
const fileName = path.basename(appPath)

console.log(`Enviando ${fileName} (${formatBytes(stats.size)}) para o BrowserStack App Automate...`)

const form = new FormData()
form.append('file', new Blob([await fs.readFile(appPath)]), fileName)

const response = await request(`${env.apiBase}/app-automate/upload`, {
    method: 'POST',
    headers: { Authorization: env.auth },
    body: form
})

const result = await response.json()
const appUrl = result.app_url

if (!appUrl) {
    fail(`O BrowserStack não devolveu app_url: ${JSON.stringify(result).slice(0, 300)}`)
}

console.log(`App enviado: ${appUrl}`)
await appendSummary([`### BrowserStack — app enviado`, '', `- **Arquivo:** \`${fileName}\` (${formatBytes(stats.size)})`, `- **app_url:** \`${appUrl}\``])

// O workflow lê esta variável para passar a capability appium:app.
if (process.env.GITHUB_ENV) {
    await fs.appendFile(process.env.GITHUB_ENV, `BROWSERSTACK_APP_URL=${appUrl}\n`, 'utf8')
}

console.log(appUrl)

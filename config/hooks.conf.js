import fs from 'node:fs'
import path from 'node:path'
import { driver } from '@wdio/globals'

const BUNDLE_ID = 'br.com.lojaebac'
const SAUCE_SESSION_FILE = process.env.SAUCE_SESSION_FILE || path.resolve('.sauce', 'session-id.txt')

/**
 * A Home do app renderiza a lista completa de produtos (sem virtualização),
 * o que gera milhares de nós na árvore de acessibilidade. No device farm o
 * snapshot do XCUITest passa a estourar o timeout de 60 s do XCTest e cada
 * busca de elemento leva de 60 a 270 s (medido em sessão real do SauceLabs).
 *
 * Limitar a profundidade e a quantidade de filhos por nó e usar a primeira
 * ocorrência reduz o custo do snapshot, mantendo acessíveis os testIDs que o
 * teste usa (barra de abas, campo de busca, botões).
 */
const XCUITEST_SETTINGS = {
    useFirstMatch: true,
    snapshotMaxDepth: 25,
    snapshotMaxChildren: 40,
    animationCoolOffTimeout: 0,
    waitForIdleTimeout: 0,
    reduceMotion: true,
    useJSONSource: true
}

async function applyXcuitestSettings () {
    try {
        await driver.updateSettings(XCUITEST_SETTINGS)
        console.log(`Settings do XCUITest aplicados: ${JSON.stringify(XCUITEST_SETTINGS)}`)
    } catch (error) {
        console.warn(`Não foi possível aplicar os settings do XCUITest: ${error.message}`)
    }
}

export let hooksConf = {
    /**
     * Guarda o ID da sessão do SauceLabs para que o pipeline consiga baixar
     * o vídeo e os logs da execução ao final do job. O hook `before` roda
     * depois da sessão ser criada e antes da primeira suíte; `afterSession`
     * não serve porque o WDIO já encerrou a sessão nesse ponto.
     */
    before: async function () {
        if (process.env.ENVIRONMENT !== 'saucelabs') return

        const id = driver.sessionId
        if (!id) return

        try {
            fs.mkdirSync(path.dirname(SAUCE_SESSION_FILE), { recursive: true })
            fs.writeFileSync(SAUCE_SESSION_FILE, id, 'utf8')
            console.log(`Sessão SauceLabs: ${id}`)
        } catch (error) {
            console.warn(`Não foi possível salvar o ID da sessão do SauceLabs: ${error.message}`)
        }

        await applyXcuitestSettings()
    },

    beforeTest: async function () {
        try {
            const state = await driver.queryAppState(BUNDLE_ID)
            // 4 = app em foreground
            if (state !== 4) {
                await driver.execute('mobile: launchApp', { bundleId: BUNDLE_ID })
            }
        } catch (error) {
            // Caso o estado não possa ser consultado, segue com a sessão criada pelo WDIO.
            console.warn(`Não foi possível verificar o estado do app: ${error.message}`)
        }
    },

    afterTest: async function () {
        try {
            await driver.execute('mobile: terminateApp', { bundleId: BUNDLE_ID })
        } catch (error) {
            console.warn(`Não foi possível encerrar o app: ${error.message}`)
        }
    }
}

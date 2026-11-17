import fs from 'node:fs'
import path from 'node:path'
import { driver } from '@wdio/globals'

const BUNDLE_ID = 'br.com.lojaebac'
const SAUCE_SESSION_FILE = process.env.SAUCE_SESSION_FILE || path.resolve('.sauce', 'session-id.txt')
const BROWSERSTACK_SESSION_FILE = process.env.BROWSERSTACK_SESSION_FILE || path.resolve('.browserstack', 'session-id.txt')
const REMOTE_ENVIRONMENTS = ['saucelabs', 'browserstack']

/**
 * A Home do app renderiza a lista completa de produtos (sem virtualização),
 * o que gera milhares de nós na árvore de acessibilidade. Em simuladores
 * lentos o snapshot do XCUITest chega a estourar o timeout do XCTest.
 *
 * Os settings abaixo reduzem o custo do snapshot sem remover os testIDs das
 * telas internas. Valores baixos de snapshotMaxDepth (ex.: 25) escondem os
 * campos de login em devices reais; 100 é suficiente para o fluxo inteiro.
 */
const XCUITEST_SETTINGS = {
    // useFirstMatch e profundidade muito baixa cortam os campos do login e
    // os testIDs das telas internas em devices reais (medido no BrowserStack).
    useFirstMatch: false,
    snapshotMaxDepth: Number(process.env.SNAPSHOT_MAX_DEPTH || 100),
    snapshotMaxChildren: Number(process.env.SNAPSHOT_MAX_CHILDREN || 200),
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
     * Guarda o ID da sessão do device farm para que o pipeline consiga baixar
     * o vídeo e os logs da execução ao final do job. O hook `before` roda
     * depois da sessão ser criada e antes da primeira suíte; `afterSession`
     * não serve porque o WDIO já encerrou a sessão nesse ponto.
     */
    before: async function () {
        const environment = process.env.ENVIRONMENT
        if (!REMOTE_ENVIRONMENTS.includes(environment)) return

        const id = driver.sessionId
        if (!id) return

        const sessionFile = environment === 'browserstack' ? BROWSERSTACK_SESSION_FILE : SAUCE_SESSION_FILE

        try {
            fs.mkdirSync(path.dirname(sessionFile), { recursive: true })
            fs.writeFileSync(sessionFile, id, 'utf8')
            console.log(`Sessão ${environment}: ${id}`)
        } catch (error) {
            console.warn(`Não foi possível salvar o ID da sessão (${environment}): ${error.message}`)
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

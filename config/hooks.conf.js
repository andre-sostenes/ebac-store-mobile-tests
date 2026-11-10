import { driver } from '@wdio/globals'

const BUNDLE_ID = 'br.com.lojaebac'

export let hooksConf = {
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
            await driver.takeScreenshot()
        } catch (error) {
            console.warn(`Não foi possível capturar o screenshot: ${error.message}`)
        }

        try {
            await driver.execute('mobile: terminateApp', { bundleId: BUNDLE_ID })
        } catch (error) {
            console.warn(`Não foi possível encerrar o app: ${error.message}`)
        }
    }
}

import { $, driver } from '@wdio/globals'
import { tap } from '../helpers/tap.js'

const BUNDLE_ID = 'br.com.lojaebac'

class HomePage {
    get searchBar () {
        return $('~search-products')
    }

    get cartIcon () {
        return $('~cart')
    }

    /**
     * Reinicia o app mantendo a sessão do usuário.
     * Usado como fallback quando a tab bar não está acessível.
     */
    async restartApp () {
        try {
            await driver.execute('mobile: terminateApp', { bundleId: BUNDLE_ID })
        } catch (error) {
            console.warn(`Não foi possível encerrar o app: ${error.message}`)
        }

        await driver.execute('mobile: launchApp', { bundleId: BUNDLE_ID })
        await driver.pause(3000)
    }

    /**
     * Navega pelas abas inferiores.
     * No iOS o testID da aba é `tab-<NomeDaRota>`; no Android usamos os nomes dos ícones.
     *
     * Espera a aba existir antes de clicar: em device farm o app pode demorar
     * para concluir a navegação (login, abertura do carrinho etc.).
     */
    async openMenu (menu) {
        const androidTabs = {
            Home: 'home',
            Browse: 'store',
            Order: 'order',
            Account: 'profile'
        }
        const tab = driver.isIOS ? menu : androidTabs[menu]
        const tabElement = $(`~tab-${tab}`)

        // Enquanto a Home carrega no device farm, cada busca de elemento pode
        // levar dezenas de segundos; por isso a primeira espera é curta e o
        // fallback (reiniciar o app) usa um timeout bem maior.
        const found = await tabElement.waitForExist({ timeout: 30000 }).catch(() => false)

        if (!found) {
            // A tab bar pode ficar oculta (display: none) depois do login,
            // quando o teclado virtual estava aberto. Reiniciar o app volta
            // ao estado inicial com as abas visíveis e a sessão mantida.
            await this.restartApp()
            await tabElement.waitForExist({ timeout: 180000 })
        }

        await tabElement.waitForDisplayed({ timeout: 30000 }).catch(() => {})
        await tap(tabElement)
    }

    async openSearch () {
        await this.searchBar.waitForDisplayed()
        await tap(this.searchBar)
    }

    async openCart () {
        await this.cartIcon.waitForDisplayed()
        await tap(this.cartIcon)
    }
}

export default new HomePage()

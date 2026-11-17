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

        // A tab bar pode ficar oculta (display: none) depois do login ou ao
        // voltar da tela de produto. Nesse caso o elemento existe na árvore,
        // mas o clique é ignorado. Exigir visible antes de clicar evita o
        // falso positivo; se não ficar visível, reinicia o app (a sessão do
        // usuário é mantida) e tenta novamente.
        let visible = await tabElement.waitForDisplayed({ timeout: 15000 }).catch(() => false)

        if (!visible) {
            await this.restartApp()
            visible = await tabElement.waitForDisplayed({ timeout: 180000 }).catch(() => false)

            if (!visible) {
                throw new Error(`A aba ${menu} não ficou visível após reiniciar o app`)
            }
        }

        await tap(tabElement)
    }

    async openSearch () {
        await this.searchBar.waitForDisplayed()
        await tap(this.searchBar)
    }

    async openCart () {
        // Depois de voltar da tela de produto, o clique no ícone do carrinho
        // pode ser ignorado pelo WDA. Tenta o clique normal e, se a tela não
        // abrir, repete tocando nas coordenadas do próprio elemento.
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                await this.cartIcon.waitForDisplayed()
                await tap(this.cartIcon)
                await driver.pause(3000)

                if (await $('~selectAddressOrContinueToPayment').isExisting()) return

                const rect = await this.cartIcon.getLocation()
                const size = await this.cartIcon.getSize()
                await driver.execute('mobile: tap', {
                    x: Math.round(rect.x + size.width / 2),
                    y: Math.round(rect.y + size.height / 2)
                })
                await driver.pause(3000)

                if (await $('~selectAddressOrContinueToPayment').isExisting()) return
            } catch (error) {
                console.warn(`Tentativa ${attempt} de abrir o carrinho falhou: ${error.message}`)
            }
        }
    }
}

export default new HomePage()

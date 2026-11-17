import { $, browser } from '@wdio/globals'
import { tap } from '../helpers/tap.js'

class ProductPage {
    get addToCartButton () {
        return $('~addToCart')
    }

    get backButton () {
        return $('~back')
    }

    async getProductTitle (name) {
        return $(`~${name}`)
    }

    async addToCart () {
        await this.addToCartButton.waitForDisplayed()
        await tap(this.addToCartButton)

        // Em caso de sucesso o app chama `navigate('Carts')`. Se a chamada
        // `updateCart` falhar (por exemplo, produto sem estoque), aparece um
        // toast e a tela de produto permanece aberta. Falhar aqui dá um
        // diagnóstico muito mais claro do que esperar pelo carrinho depois.
        const navigated = await $('~selectAddressOrContinueToPayment')
            .waitForDisplayed({ timeout: 45000 })
            .catch(() => false)

        if (!navigated) {
            const source = await browser.getPageSource().catch(() => '')
            const stockError = source.match(/[^\"]{0,80}quantities available[^\"]{0,80}/i)
            throw new Error(
                'O app não navegou para o carrinho após "Add To Cart". ' +
                (stockError ? `Erro do app: ${stockError[0]}. ` : '') +
                `Tela atual: ${source.slice(0, 400)}`
            )
        }
    }

    async goBack () {
        await this.backButton.waitForDisplayed()
        await tap(this.backButton)
    }
}

export default new ProductPage()

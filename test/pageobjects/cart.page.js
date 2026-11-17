import { $, browser } from '@wdio/globals'
import { tap } from '../helpers/tap.js'

class CartPage {
    get addressName () {
        return $('~addressName')
    }

    get addNewAddressLink () {
        return $('~addNewAddress')
    }

    get continueButton () {
        return $('~selectAddressOrContinueToPayment')
    }

    get total () {
        return $('~total')
    }

    async waitForCart () {
        await this.continueButton.waitForDisplayed({ timeout: 60000 })
    }

    /**
     * O endereço é carregado de forma assíncrona junto com o carrinho.
     * Aguarda um pouco para não cadastrar um endereço quando o usuário já possui um.
     */
    async hasAddress () {
        await this.waitForCart()

        try {
            await this.addressName.waitForDisplayed({ timeout: 10000 })
            return true
        } catch (error) {
            return false
        }
    }

    async openAddressForm () {
        await this.addNewAddressLink.waitForDisplayed()
        await tap(this.addNewAddressLink)
    }

    async continueToPayment () {
        await this.continueButton.waitForDisplayed()
        await browser.waitUntil(
            async () => this.continueButton.isEnabled(),
            {
                timeout: 60000,
                timeoutMsg: 'O botão "Continue to payment" permaneceu desabilitado'
            }
        )
        await tap(this.continueButton)
    }
}

export default new CartPage()

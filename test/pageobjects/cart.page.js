import { $ } from '@wdio/globals'

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
        await this.continueButton.waitForDisplayed({ timeout: 20000 })
    }

    /**
     * O endereço é carregado de forma assíncrona junto com o carrinho.
     * Aguarda um pouco para não cadastrar um endereço quando o usuário já possui um.
     */
    async hasAddress () {
        await this.waitForCart()

        try {
            await this.addressName.waitForDisplayed({ timeout: 5000 })
            return true
        } catch (error) {
            return false
        }
    }

    async openAddressForm () {
        await this.addNewAddressLink.waitForDisplayed()
        await this.addNewAddressLink.click()
    }

    async continueToPayment () {
        await this.continueButton.waitForDisplayed()
        await browser.waitUntil(
            async () => this.continueButton.isEnabled(),
            {
                timeout: 20000,
                timeoutMsg: 'O botão "Continue to payment" permaneceu desabilitado'
            }
        )
        await this.continueButton.click()
    }
}

export default new CartPage()

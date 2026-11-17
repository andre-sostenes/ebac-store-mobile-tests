import { $, browser } from '@wdio/globals'
import { tap } from '../helpers/tap.js'

class PaymentPage {
    get cashOnDeliveryOption () {
        return $('~option-1')
    }

    get checkoutButton () {
        return $('~completeCheckout')
    }

    get total () {
        return $('~total')
    }

    async selectCashOnDelivery () {
        await this.cashOnDeliveryOption.waitForDisplayed()
        await tap(this.cashOnDeliveryOption)
    }

    async completeCheckout () {
        await this.checkoutButton.waitForDisplayed()
        await browser.waitUntil(
            async () => this.checkoutButton.isEnabled(),
            {
                timeout: 60000,
                timeoutMsg: 'O botão "Checkout" permaneceu desabilitado'
            }
        )
        await tap(this.checkoutButton)
    }
}

export default new PaymentPage()

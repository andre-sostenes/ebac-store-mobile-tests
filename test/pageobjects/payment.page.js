import { $ } from '@wdio/globals'

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
        await this.cashOnDeliveryOption.click()
    }

    async completeCheckout () {
        await this.checkoutButton.waitForDisplayed()
        await browser.waitUntil(
            async () => this.checkoutButton.isEnabled(),
            {
                timeout: 20000,
                timeoutMsg: 'O botão "Checkout" permaneceu desabilitado'
            }
        )
        await this.checkoutButton.click()
    }
}

export default new PaymentPage()

import { $ } from '@wdio/globals'

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
        await this.addToCartButton.click()
    }

    async goBack () {
        await this.backButton.waitForDisplayed()
        await this.backButton.click()
    }
}

export default new ProductPage()

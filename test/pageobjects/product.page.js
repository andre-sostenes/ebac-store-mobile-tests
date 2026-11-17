import { $ } from '@wdio/globals'
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
    }

    async goBack () {
        await this.backButton.waitForDisplayed()
        await tap(this.backButton)
    }
}

export default new ProductPage()

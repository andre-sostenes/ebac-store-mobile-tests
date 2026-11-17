import { $, $$, browser } from '@wdio/globals'
import { tap } from '../helpers/tap.js'
import productPage from './product.page.js'

class BrowsePage {
    get searchInput () {
        return $('~searchInput')
    }

    get products () {
        return $$('~productDetails')
    }

    async search (term) {
        await this.searchInput.waitForDisplayed()
        await this.searchInput.setValue(term)
    }

    async selectProduct (index = 0) {
        await browser.waitUntil(
            async () => (await this.products).length > 0,
            {
                timeout: 60000,
                timeoutMsg: 'Nenhum produto encontrado na busca'
            }
        )

        const products = await this.products
        const product = products[index]

        if (!product) {
            throw new Error(`Produto no índice ${index} não encontrado`)
        }

        await product.waitForDisplayed()
        await tap(product)

        // No device farm o teclado virtual fica aberto depois da busca e o
        // primeiro toque pode apenas fechá-lo (ScrollView com
        // keyboardShouldPersistTaps padrão). Se a tela do produto não abrir,
        // toca novamente.
        const abriu = await productPage.addToCartButton
            .waitForExist({ timeout: 20000 })
            .catch(() => false)

        if (!abriu) {
            await tap(product)
            await productPage.addToCartButton.waitForExist({ timeout: 60000 })
        }
    }
}

export default new BrowsePage()

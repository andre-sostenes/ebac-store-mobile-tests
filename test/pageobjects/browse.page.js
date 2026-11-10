import { $, $$ } from '@wdio/globals'

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
                timeout: 20000,
                timeoutMsg: 'Nenhum produto encontrado na busca'
            }
        )

        const products = await this.products
        const product = products[index]

        if (!product) {
            throw new Error(`Produto no índice ${index} não encontrado`)
        }

        await product.waitForDisplayed()
        await product.click()
    }
}

export default new BrowsePage()

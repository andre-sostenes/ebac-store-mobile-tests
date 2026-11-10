import { expect } from '@wdio/globals'
import homePage from '../pageobjects/home.page.js'
import browsePage from '../pageobjects/browse.page.js'
import { searchTerm } from '../data/user.js'

describe('Search', () => {
    it('should list products with prices', async () => {
        await homePage.openMenu('Home')
        await homePage.openSearch()
        await browsePage.search(searchTerm)

        await browser.waitUntil(
            async () => (await browsePage.products).length > 0,
            {
                timeout: 20000,
                timeoutMsg: 'Nenhum produto encontrado na busca'
            }
        )

        const products = await browsePage.products
        expect(products.length).toBeGreaterThan(0)

        for (const product of products) {
            expect(await product.getText()).toContain('R$')
        }
    })
})

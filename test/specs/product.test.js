import { expect } from '@wdio/globals'
import homePage from '../pageobjects/home.page.js'
import browsePage from '../pageobjects/browse.page.js'
import productPage from '../pageobjects/product.page.js'
import { searchTerm } from '../data/user.js'

describe('Product Details', () => {
    it('should open a product and show the add to cart action', async () => {
        await homePage.openMenu('Home')
        await homePage.openSearch()
        await browsePage.search(searchTerm)
        await browsePage.selectProduct(0)

        await expect(productPage.addToCartButton).toBeDisplayed()
    })
})

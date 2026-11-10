import { expect } from '@wdio/globals'
import homePage from '../pageobjects/home.page.js'
import loginPage from '../pageobjects/login.page.js'
import profilePage from '../pageobjects/profile.page.js'
import browsePage from '../pageobjects/browse.page.js'
import productPage from '../pageobjects/product.page.js'
import cartPage from '../pageobjects/cart.page.js'
import addressPage from '../pageobjects/address.page.js'
import paymentPage from '../pageobjects/payment.page.js'
import orderSuccessPage from '../pageobjects/orderSuccess.page.js'
import { user, address, searchTerm } from '../data/user.js'

describe('Checkout', () => {
    it('should complete the purchase flow from login to order confirmation', async () => {
        // 1. Login
        await homePage.openMenu('Account')
        await browser.waitUntil(
            async () => (await loginPage.email.isExisting()) || (await profilePage.customerEmail.isExisting()),
            {
                timeout: 20000,
                timeoutMsg: 'A tela de login ou o perfil do usuário não foi exibido'
            }
        )

        if (await loginPage.email.isExisting()) {
            await loginPage.login(user.email, user.password)
            // Em caso de sessão recém-criada, volta para a raiz da aba Account.
            await homePage.openMenu('Account')
        }

        await expect(profilePage.customerEmail).toBeDisplayed()
        expect(await profilePage.customerEmail.getText()).toContain(user.email)

        // 2. Browse + escolha de um produto
        await homePage.openMenu('Home')
        await homePage.openSearch()
        await browsePage.search(searchTerm)
        await browsePage.selectProduct(0)
        await expect(productPage.addToCartButton).toBeDisplayed()

        // 3. Adiciona o produto ao carrinho
        await productPage.addToCart()
        await productPage.goBack()

        // 4. Abre o carrinho
        await homePage.openMenu('Home')
        await homePage.openCart()
        await cartPage.waitForCart()
        expect(await cartPage.total.getText()).toContain('R$')

        // 5. Cadastra um endereço somente se o usuário ainda não tiver um
        if (!(await cartPage.hasAddress())) {
            await cartPage.openAddressForm()
            await addressPage.addAddress(address)
            await cartPage.addressName.waitForDisplayed({ timeout: 20000 })
        }

        // 6. Vai para o pagamento
        await cartPage.continueToPayment()

        // 7. Seleciona Cash on Delivery e finaliza o checkout
        await paymentPage.selectCashOnDelivery()
        await paymentPage.completeCheckout()

        // 8. Confirma o sucesso do pedido
        await orderSuccessPage.waitForSuccess()
        await expect(orderSuccessPage.successImage).toBeDisplayed()
        await expect(orderSuccessPage.goBackHomeButton).toBeDisplayed()
    })
})

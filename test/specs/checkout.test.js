import { browser, expect } from '@wdio/globals'
import homePage from '../pageobjects/home.page.js'
import loginPage from '../pageobjects/login.page.js'
import profilePage from '../pageobjects/profile.page.js'
import browsePage from '../pageobjects/browse.page.js'
import productPage from '../pageobjects/product.page.js'
import cartPage from '../pageobjects/cart.page.js'
import addressPage from '../pageobjects/address.page.js'
import paymentPage from '../pageobjects/payment.page.js'
import orderSuccessPage from '../pageobjects/orderSuccess.page.js'
import { user, address, searchTerm, inStockPrice } from '../data/user.js'

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
            // O login redireciona para a Home, mas deixa a tab bar oculta no
            // device farm; o restart restaura a barra e mantém a sessão.
            await loginPage.waitForHome()
        }

        await homePage.openMenu('Account')

        await expect(profilePage.customerEmail).toBeDisplayed()
        expect(await profilePage.customerEmail.getText()).toContain(user.email)

        // 2. Browse + escolha de um produto
        // A busca é feita na aba Browse: na Home a barra de busca só é
        // renderizada depois que a lista de produtos termina de carregar.
        await homePage.openMenu('Browse')
        await browsePage.search(searchTerm)
        await browsePage.selectProduct(0, inStockPrice)
        await expect(productPage.addToCartButton).toBeDisplayed()

        // 3. Adiciona o produto ao carrinho. O próprio app navega para a tela
        // do carrinho quando `updateCart` retorna sucesso.
        await productPage.addToCart()

        // 4. Confere o carrinho
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

import { expect } from '@wdio/globals'
import homePage from '../pageobjects/home.page.js'
import loginPage from '../pageobjects/login.page.js'
import profilePage from '../pageobjects/profile.page.js'
import { user } from '../data/user.js'

describe('Login', () => {
    it('should login with valid credentials', async () => {
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
            await homePage.openMenu('Account')
        }

        await expect(profilePage.customerEmail).toBeDisplayed()
        expect(await profilePage.customerEmail.getText()).toContain(user.email)
    })
})

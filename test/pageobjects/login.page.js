import { $, browser, driver } from '@wdio/globals'
import { tap } from '../helpers/tap.js'
import homePage from './home.page.js'

class LoginPage {
    get email () {
        return $('~email')
    }

    get password () {
        if (driver.isAndroid) {
            return $('android=new UiSelector().text("Password")')
        }
        return $('~password')
    }

    get btnLogin () {
        if (driver.isAndroid) {
            return $('~Login')
        }
        return $('~btnLogin')
    }

    async isOpen () {
        return (await this.email.isExisting()) && (await this.email.isDisplayed())
    }

    async login (email, password) {
        await this.email.waitForDisplayed()
        await this.email.setValue(email)
        await this.password.setValue(password)
        await this.btnLogin.waitForDisplayed()
        await tap(this.btnLogin)
    }

    /**
     * Aguarda o login concluir e devolve o app a um estado em que a barra de
     * abas está acessível.
     *
     * O app usa `tabBarHideOnKeyboard`. No device farm o teclado virtual está
     * aberto quando o login é enviado e o evento de "teclado fechado" não é
     * processado; com isso a tab bar fica com `display: none` e os elementos
     * `~tab-*` desaparecem da árvore de acessibilidade, mesmo com o app já na
     * Home. Reiniciar o app restaura a barra e mantém a sessão do usuário
     * (`noReset` + `keepKeyChains`).
     *
     * Também evitamos esperar o desaparecimento de elementos: no SauceLabs uma
     * busca por elemento inexistente chega a levar mais de um minuto.
     */
    async waitForHome (pause = 30000) {
        await browser.pause(pause)
        await homePage.restartApp()
    }
}

export default new LoginPage()

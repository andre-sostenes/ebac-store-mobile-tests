import { $, driver } from '@wdio/globals'

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
        await this.btnLogin.click()
    }
}

export default new LoginPage()

import { $, driver } from '@wdio/globals'

class ProfilePage {
    get customerName () {
        return $('~CustomerName')
    }

    get customerEmail () {
        return $('~CustomerEmail')
    }

    async profileName (name) {
        if (driver.isIOS) {
            return $(`~${name}`)
        }
        return $(`//android.widget.TextView[@text="${name}"]`)
    }
}

export default new ProfilePage()

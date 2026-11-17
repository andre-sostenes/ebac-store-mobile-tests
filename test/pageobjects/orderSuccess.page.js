import { $ } from '@wdio/globals'

class OrderSuccessPage {
    get successImage () {
        return $('~transactionSuccessfulImage')
    }

    get goBackHomeButton () {
        return $('~goBackHome')
    }

    async waitForSuccess () {
        await this.successImage.waitForDisplayed({ timeout: 60000 })
    }
}

export default new OrderSuccessPage()

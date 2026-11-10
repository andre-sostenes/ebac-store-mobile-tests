import { $, driver } from '@wdio/globals'

class HomePage {
    get searchBar () {
        return $('~search-products')
    }

    get cartIcon () {
        return $('~cart')
    }

    /**
     * Navega pelas abas inferiores.
     * No iOS o testID da aba é `tab-<NomeDaRota>`; no Android usamos os nomes dos ícones.
     */
    async openMenu (menu) {
        const androidTabs = {
            Home: 'home',
            Browse: 'store',
            Order: 'order',
            Account: 'profile'
        }
        const tab = driver.isIOS ? menu : androidTabs[menu]

        await $(`~tab-${tab}`).click()
    }

    async openSearch () {
        await this.searchBar.waitForDisplayed()
        await this.searchBar.click()
    }

    async openCart () {
        await this.cartIcon.waitForDisplayed()
        await this.cartIcon.click()
    }
}

export default new HomePage()

import { $, $$, driver } from '@wdio/globals'

class AddressPage {
    get saveButton () {
        return $('~save')
    }

    get fields () {
        return $$('-ios predicate string:type == "XCUIElementTypeTextField"')
    }

    async fillField (index, value) {
        const fields = await this.fields
        const field = fields[index]

        if (!field) {
            throw new Error(`Campo de endereço no índice ${index} não encontrado`)
        }

        await field.waitForDisplayed()
        await field.setValue(value)

        try {
            await driver.hideKeyboard()
        } catch (error) {
            // O teclado pode já ter sido fechado automaticamente.
        }
    }

    /**
     * Ordem dos campos na tela "Add a new address":
     * 0 = Name, 1 = Mobile Number, 2 = Address, 3 = City, 4 = State, 5 = ZipCode.
     *
     * Esses campos não possuem testID no app; por isso usamos a ordem dos
     * XCUIElementTypeTextField da tela.
     */
    async addAddress (address) {
        const values = [
            address.name,
            address.phone,
            address.address,
            address.city,
            address.state,
            address.zipCode
        ]

        for (const [index, value] of values.entries()) {
            await this.fillField(index, value)
        }

        await this.saveButton.waitForDisplayed()
        await this.saveButton.click()
    }
}

export default new AddressPage()

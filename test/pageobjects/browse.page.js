import { $, $$, browser, driver } from '@wdio/globals'
import { tap } from '../helpers/tap.js'
import productPage from './product.page.js'

class BrowsePage {
    get searchInput () {
        return $('~searchInput')
    }

    get products () {
        return $$('~productDetails')
    }

    async search (term) {
        await this.searchInput.waitForDisplayed()
        await this.searchInput.setValue(term)

        // Aguarda a lista refletir o termo digitado: logo após o setValue a
        // árvore ainda pode conter os produtos da tela anterior.
        await browser.waitUntil(
            async () => {
                const products = await this.products
                if (products.length === 0) {
                    return false
                }
                for (const product of products) {
                    const text = await product.getText().catch(() => '')
                    if (text.toLowerCase().includes(term.toLowerCase())) {
                        return true
                    }
                }
                return false
            },
            {
                timeout: 30000,
                timeoutMsg: `A busca por "${term}" não retornou produtos atualizados`
            }
        )

        // O app usa tabBarHideOnKeyboard. Se o teclado continuar aberto, a barra
        // de abas fica com display:none e os cliques em Home/carrinho são
        // ignorados até o app ser reiniciado — inclusive depois de voltar da
        // tela de produto. Fechar o teclado aqui evita esse estado.
        await driver.hideKeyboard().catch(() => {})
    }

    async visibleProducts () {
        const products = await this.products
        const visible = []

        // O seletor ~productDetails também devolve cards de telas anteriores
        // que continuam na árvore de acessibilidade (display: none). Filtrar
        // por isDisplayed evita tocar em um cartão invisível.
        for (const candidate of products) {
            if (!(await candidate.isDisplayed().catch(() => false))) {
                continue
            }
            visible.push({
                element: candidate,
                text: (await candidate.getText().catch(() => '')).replace(/\s+/g, ' ').trim()
            })
        }

        return { products, visible }
    }

    async selectProduct (index = 0, preferredText) {
        let products = []
        let visible = []

        await browser.waitUntil(
            async () => {
                const result = await this.visibleProducts()
                products = result.products
                visible = result.visible

                if (visible.length === 0) {
                    return false
                }
                return !preferredText || visible.some((item) => item.text.includes(preferredText))
            },
            {
                timeout: 60000,
                timeoutMsg: preferredText
                    ? `Nenhum produto visível contendo "${preferredText}" na busca`
                    : 'Nenhum produto encontrado na busca'
            }
        )

        // Permite escolher um produto específico (por exemplo, o que tem
        // estoque) mesmo quando ele não é o primeiro da lista.
        let chosen = preferredText ? visible.find((item) => item.text.includes(preferredText)) : undefined
        if (!chosen) {
            chosen = visible[index] || visible[0]
        }

        console.log(`Produto selecionado: ${chosen.text} (${visible.length} de ${products.length} visíveis)`)
        await tap(chosen.element)

        // No device farm o teclado virtual fica aberto depois da busca e o
        // primeiro toque pode apenas fechá-lo (ScrollView com
        // keyboardShouldPersistTaps padrão). Se a tela do produto não abrir,
        // toca novamente.
        const abriu = await productPage.addToCartButton
            .waitForExist({ timeout: 20000 })
            .catch(() => false)

        if (!abriu) {
            await tap(chosen.element)
            await productPage.addToCartButton.waitForExist({ timeout: 60000 })
        }
    }
}

export default new BrowsePage()

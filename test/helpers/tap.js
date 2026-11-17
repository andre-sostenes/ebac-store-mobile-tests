/**
 * Clica em um elemento tolerando o erro de "stale element".
 *
 * No device farm, quando o clique navega para uma tela que desmonta o próprio
 * elemento (por exemplo, a aba Account abre o login e esconde a tab bar), o
 * WDA responde com "stale element" e o WDIO trata isso como falha — mesmo com
 * a navegação concluída. Quem chama confirma o resultado com uma espera
 * positiva na tela seguinte.
 */
export async function tap (element) {
    try {
        await element.click()
    } catch (error) {
        const mensagem = error.message || ''
        const navegou = /stale|wasn't found|no such element/i.test(mensagem)

        if (!navegou) {
            throw error
        }
    }
}

export default tap

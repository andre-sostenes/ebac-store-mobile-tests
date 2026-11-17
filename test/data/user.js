export const user = {
    email: process.env.EBAC_EMAIL || 'cliente@ebac.art.br',
    password: process.env.EBAC_PASSWORD || 'GD*peToHNJ1#c$sgk08EaYJQ'
}

export const address = {
    name: 'EBAC Cliente',
    phone: '11999999999',
    address: 'Rua dos Testes, 123',
    city: 'Sao Paulo',
    state: 'SP',
    zipCode: '01001000'
}

// Termos cujos cards já visíveis na busca têm estoque no backend. Buscas como
// "In" ou "Camiseta" mostram primeiro itens com quantity: 0; nesses casos a
// API `public/updateCart/{userId}` responde 401 e o carrinho fica vazio.
export const searchTerm = 'Produto Original'
export const inStockPrice = '100'

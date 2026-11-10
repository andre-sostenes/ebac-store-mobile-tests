# EBAC Store — Testes iOS

Suíte de testes automatizados para iOS do app **LojaEBAC**, cobrindo o fluxo completo de compra:

1. Login
2. Acesso à área de busca (Browse)
3. Escolha de um produto da lista
4. Inclusão do produto no carrinho
5. Cadastro de endereço (somente se o usuário ainda não tiver um)
6. Acesso ao pagamento
7. Finalização do checkout
8. Validação da tela de pedido concluído

Projeto construído com **WebdriverIO v8 + Appium 2 + XCUITest + Mocha**.

## Estrutura

```
config/                 Configurações do WDIO (local, SauceLabs, suites, hooks e reports)
test/
  data/user.js          Credenciais e dados usados nos testes
  pageobjects/          Page Objects das telas do app
  specs/
    checkout.test.js    Fluxo completo de checkout (exercício)
    login.test.js
    product.test.js
    search.test.js
app/                    Coloque aqui o aplicativo .app (não versionado)
```

## Pré-requisitos

- Node.js 18 ou superior
- Appium 2
- macOS com Xcode e um simulador iOS **ou** uma conta SauceLabs
- App do exercício:
  - Simulador: `LojaEBAC-sim.app`
  - Device real / SauceLabs: `LojaEBAC.ipa`
  - Download: <https://github.com/EBAC-QE/ebac-store-mobile-tests/tree/ios/app>

Instale as dependências e o driver do XCUITest:

```bash
npm install
appium driver install xcuitest
```

Inicie o Appium em um terminal separado:

```bash
appium
```

## Configuração

Copie o arquivo de exemplo e ajuste o que for necessário:

```bash
cp .env.example .env
```

Para rodar no simulador local, baixe o `LojaEBAC-sim.app` e coloque em `app/LojaEBAC-sim.app` (ou defina `APP_PATH` no `.env`).

Para rodar no SauceLabs, preencha `SAUCE_USERNAME` e `SAUCE_ACCESS_KEY`, faça upload do `LojaEBAC.ipa` no SauceLabs e use `ENVIRONMENT=saucelabs`.

## Execução

```bash
# Fluxo completo de checkout
npm run test:checkout

# Todos os testes
npm test

# Suítes individuais
npm run test:login
npm run test:search
npm run test:product
```

Com relatório Allure:

```bash
REPORTER=true npm run test:checkout
npm run report
```

No PowerShell:

```powershell
$env:REPORTER="true"; npm run test:checkout
```

## Detalhes da implementação

- Os seletores usam os `testID` do React Native (acessíveis no iOS como accessibility id, via `~testID`).
- O botão de checkout do app só abre o Razorpay quando a opção de pagamento não é selecionada. Como o teste seleciona **Cash on Delivery** (`option-1`), o pedido é finalizado direto pela API, sem depender do SDK nativo do Razorpay.
- O endereço é cadastrado condicionalmente: o teste verifica se `addressName` já está visível no carrinho. Caso contrário, preenche o formulário e salva.
- Os campos do formulário de endereço não possuem `testID` no app; por isso são localizados pela ordem dos `XCUIElementTypeTextField` da tela (Name, Mobile Number, Address, City, State, ZipCode).

## Submissão do exercício

- Repositório público
- Branch utilizada: `main`
- Link do repositório como resposta no exercício

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

- Node.js conforme a versão do Appium escolhida:
  - Appium 3.9: Node `^20.19.0 || ^22.12.0 || >= 24`
  - Appium 2.x: Node 18 ou superior
- Appium 2 ou 3 (veja a tabela de compatibilidade abaixo)
- macOS com Xcode e um simulador iOS **ou** uma conta SauceLabs
- App do exercício:
  - Simulador: `LojaEBAC-sim.app`
  - Device real / SauceLabs: `LojaEBAC.ipa`
  - Download: <https://github.com/EBAC-QE/ebac-store-mobile-tests/tree/ios/app>

Instale as dependências e o driver do XCUITest:

```bash
npm install
appium driver install xcuitest@<versão-compatível>
```

> O driver precisa combinar com a versão do Appium instalada. Usar
> `appium driver install xcuitest` sem versão instala a linha mais recente
> (13.x), que exige Appium 4 beta.

| Appium instalado | Driver xcuitest | Observação |
| --- | --- | --- |
| 2.x | `xcuitest@9.10.5` | Xcode 15/16 |
| 3.x | `xcuitest@12.22.8` | Xcode 16+ |
| 4 beta | `xcuitest@13.x` | Não recomendado |

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

## Solução de problemas

**`npm.ps1 não pode ser carregado porque a execução de scripts foi desabilitada` (PowerShell)**

Use o executável `.cmd` ou libere scripts assinados para o seu usuário:

```powershell
npm.cmd install
# ou, permanente (não exige administrador):
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

**`cannot be installed because the server version it requires ... does not meet the currently installed one`**

A versão do driver não combina com o Appium. Consulte `appium -v` e a tabela de compatibilidade acima.

**`A driver named "xcuitest" is already installed`**

O driver já está instalado; o comando de instalação não precisa ser repetido. Para trocar de versão use `appium driver update xcuitest` (ou remova com `appium driver uninstall xcuitest`).

**Testes iOS não iniciam no Windows**

XCUITest depende do Xcode/WebDriverAgent, disponíveis apenas no macOS. No Windows o projeto instala e valida a configuração, mas a execução precisa de um Mac ou do SauceLabs (`ENVIRONMENT=saucelabs`).

## Submissão do exercício

- Repositório: <https://github.com/andre-sostenes/ebac-store-mobile-tests>
- Repositório público
- Branch utilizada: `main`

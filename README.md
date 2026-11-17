# EBAC Store — Testes iOS

[![Mobile CI - BrowserStack](https://github.com/andre-sostenes/ebac-store-mobile-tests/actions/workflows/ci.yml/badge.svg?branch=ci)](https://github.com/andre-sostenes/ebac-store-mobile-tests/actions/workflows/ci.yml)

Suíte de testes automatizados para iOS do app **LojaEBAC**, cobrindo o fluxo completo de compra:

1. Login
2. Acesso à área de busca (Browse)
3. Escolha de um produto da lista
4. Inclusão do produto no carrinho
5. Cadastro de endereço (somente se o usuário ainda não tiver um)
6. Acesso ao pagamento
7. Finalização do checkout
8. Validação da tela de pedido concluído

Projeto construído com **WebdriverIO v8 + Appium 2 + XCUITest + Mocha**, com execução em
**device real no BrowserStack App Automate via GitHub Actions**.

## Estrutura

```
.github/workflows/ci.yml  Pipeline de CI (GitHub Actions + BrowserStack App Automate)
config/                 Configurações do WDIO (local, BrowserStack, suites, hooks e reports)
scripts/                Upload do app e download de artefatos do BrowserStack
test/
  data/user.js          Credenciais e dados usados nos testes
  pageobjects/          Page Objects das telas do app
  specs/
    checkout.test.js    Fluxo completo de checkout (exercício)
    login.test.js
    product.test.js
    search.test.js
app/                    Coloque aqui o aplicativo (não versionado)
```

## Pré-requisitos

- Node.js conforme a versão do Appium escolhida:
  - Appium 3.9: Node `^20.19.0 || ^22.12.0 || >= 24`
  - Appium 2.x: Node 18 ou superior
- Appium 2 ou 3 (veja a tabela de compatibilidade abaixo) **apenas para execução local**
- macOS com Xcode e um simulador iOS **ou** uma conta BrowserStack
- App do exercício:
  - Simulador local: `LojaEBAC-sim.app`
  - Device real (BrowserStack): `LojaEBAC.ipa`
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

Inicie o Appium em um terminal separado (somente execução local):

```bash
appium
```

## Configuração

Copie o arquivo de exemplo e ajuste o que for necessário:

```bash
cp .env.example .env
```

Para rodar no simulador local, baixe o `LojaEBAC-sim.app` e coloque em `app/LojaEBAC-sim.app` (ou defina `APP_PATH` no `.env`).

Para rodar no BrowserStack, preencha `BROWSERSTACK_USERNAME` e `BROWSERSTACK_ACCESS_KEY`,
envie o `.ipa` e use `ENVIRONMENT=browserstack`:

```powershell
$env:ENVIRONMENT="browserstack"
$env:BROWSERSTACK_USERNAME="seu-usuario"
$env:BROWSERSTACK_ACCESS_KEY="sua-access-key"
npm.cmd run bs:upload -- app\LojaEBAC.ipa
$env:BROWSERSTACK_APP_URL="bs://..."   # valor impresso no upload
npm.cmd run test:browserstack
npm.cmd run bs:artifacts
```

O upload imprime o `app_url` (`bs://...`) usado na capability `appium:app`. Por padrão o
`browserstack.conf.js` usa um **iPhone 15 com iOS 17** (device real, Tier 2) e grava vídeo,
logs de debug e logs de rede. Os valores podem ser alterados no `.env`
(`BROWSERSTACK_APP_URL`, `BROWSERSTACK_DEVICE_NAME`, `BROWSERSTACK_OS_VERSION`,
`BROWSERSTACK_BUILD`, `BROWSERSTACK_NAME`).

> O build `LojaEBAC-sim.zip` é compilado apenas para `x86_64` e só serve ao simulador.
> No BrowserStack App Automate use sempre o `LojaEBAC.ipa`.

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

## CI — GitHub Actions + BrowserStack App Automate

O workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) executa a suíte em um
device real a cada push na branch `ci`. Também pode ser disparado manualmente em
**Actions → Mobile CI - BrowserStack → Run workflow**, escolhendo a suíte, o device e a versão do iOS.

### Secrets

Em **Settings → Secrets and variables → Actions** do repositório:

| Nome | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `BROWSERSTACK_USERNAME` | secret | sim | Usuário da conta BrowserStack |
| `BROWSERSTACK_ACCESS_KEY` | secret | sim | Access key da conta BrowserStack |

Sem os dois secrets o pipeline falha na primeira etapa com uma mensagem explícita.

### O que o pipeline faz

1. `npm ci`
2. Baixa o `LojaEBAC.ipa` do repositório oficial da EBAC
3. Envia o app para o BrowserStack (`scripts/bs-upload.mjs`)
4. Executa o `checkout.test.js` no BrowserStack App Automate (padrão: iPhone 15, iOS 17)
5. Baixa o vídeo e os logs da sessão (`scripts/bs-artifacts.mjs`)
6. Publica `browserstack-artifacts/` e `allure-results/` como artifacts e escreve o link da sessão no resumo da execução

O vídeo fica em `browserstack-artifacts/video.mp4` (artifact `browserstack-artifacts-<run>`);
o link da sessão é `https://app-automate.browserstack.com/dashboard/v2/sessions/<session-id>`.

## Detalhes da implementação

- Os seletores usam os `testID` do React Native (acessíveis no iOS como accessibility id, via `~testID`).
- O botão de checkout do app só abre o Razorpay quando a opção de pagamento não é selecionada. Como o teste seleciona **Cash on Delivery** (`option-1`), o pedido é finalizado direto pela API, sem depender do SDK nativo do Razorpay.
- O endereço é cadastrado condicionalmente: o teste verifica se `addressName` já está visível no carrinho. Caso contrário, preenche o formulário e salva.
- Os campos do formulário de endereço não possuem `testID` no app; por isso são localizados pela ordem dos `XCUIElementTypeTextField` da tela (Name, Mobile Number, Address, City, State, ZipCode).
- O app usa `tabBarHideOnKeyboard` e, no device farm, o teclado virtual está aberto quando o login é enviado. Se o evento de "teclado fechado" não for processado, a tab bar fica com `display: none` e os elementos `tab-*` desaparecem da árvore de acessibilidade — mesmo com o app já na Home. Por isso o teste reinicia o app logo após o login (`loginPage.waitForHome()`), o que restaura a barra e mantém a sessão; o `home.page.js` repete esse fallback caso alguma aba não apareça.
- A busca é feita na aba **Browse**, não na Home: a barra de busca da Home só é renderizada depois que a lista de produtos termina de carregar, então `~search-products` pode não existir por dezenas de segundos no device farm.
- O teclado virtual é fechado explicitamente após a busca (`driver.hideKeyboard()`). Sem isso, o `tabBarHideOnKeyboard` do app deixa a barra de abas com `display: none`; o elemento `cart` continua na árvore, mas em cache e invisível, e os cliques em Home/carrinho são ignorados silenciosamente.
- O termo de busca é `Produto Original` (itens com `quantity: 10` no backend). Termos como `In` ou `Camiseta` exibem primeiro cards sem estoque: a API `public/updateCart/{userId}` responde `401 "0 quantities available..."`, o app mostra apenas um toast e o carrinho continua vazio. `browsePage.selectProduct()` filtra cards realmente visíveis e `productPage.addToCart()` espera a navegação automática para `Carts`, falhando com diagnóstico se ela não acontecer.
- Uma busca por elemento **inexistente** pode levar mais de um minuto (o WDA varre a árvore inteira). O teste foi escrito para esperar por elementos que devem aparecer (esperas positivas) em vez de aguardar o desaparecimento de outros.
- A Home renderiza a lista de produtos sem virtualização, o que gera milhares de nós na árvore de acessibilidade. O hook `before` aplica settings que limitam o snapshot (`useFirstMatch`, `snapshotMaxDepth`, `snapshotMaxChildren`, `animationCoolOffTimeout`, `waitForIdleTimeout` e `reduceMotion`); os cliques usam o helper `tap.js`, que tolera o erro de *stale element* quando a navegação desmonta o elemento clicado.

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

XCUITest depende do Xcode/WebDriverAgent, disponíveis apenas no macOS. No Windows a execução
local não é possível; use o BrowserStack (`ENVIRONMENT=browserstack`) ou o GitHub Actions.

## Submissão do exercício

- Repositório (público): <https://github.com/andre-sostenes/ebac-store-mobile-tests>
- Branch utilizada: **`ci`**
- Pipeline: <https://github.com/andre-sostenes/ebac-store-mobile-tests/actions/workflows/ci.yml>
- Vídeo da execução: artifact `browserstack-artifacts-<run>` (ou link da sessão no BrowserStack)

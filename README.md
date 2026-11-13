# EBAC Store — Testes iOS

[![Mobile CI - SauceLabs](https://github.com/andre-sostenes/ebac-store-mobile-tests/actions/workflows/ci.yml/badge.svg?branch=ci)](https://github.com/andre-sostenes/ebac-store-mobile-tests/actions/workflows/ci.yml)

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
**Device Farm (SauceLabs) via GitHub Actions**.

## Estrutura

```
.github/workflows/ci.yml  Pipeline de CI (GitHub Actions + SauceLabs)
config/                 Configurações do WDIO (local, SauceLabs, suites, hooks e reports)
scripts/                Upload do app e download de artefatos do SauceLabs
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
- Appium 2 ou 3 (veja a tabela de compatibilidade abaixo)
- macOS com Xcode e um simulador iOS **ou** uma conta SauceLabs
- App do exercício:
  - Simulador local: `LojaEBAC-sim.app`
  - Simulador no SauceLabs: `LojaEBAC-sim.zip`
  - Device real: `LojaEBAC.ipa`
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

Para rodar no SauceLabs, preencha `SAUCE_USERNAME` e `SAUCE_ACCESS_KEY`, envie o build de simulador e use `ENVIRONMENT=saucelabs`:

```powershell
$env:ENVIRONMENT="saucelabs"
npm.cmd run sauce:upload -- app\LojaEBAC-sim.zip
npm.cmd run test:sauce
npm.cmd run sauce:artifacts
```

O script de upload imprime a capability `appium:app=storage:filename=...`; por padrão o `sauce.conf.js` usa `storage:filename=LojaEBAC-sim.zip`, `iPhone 15 Simulator` e iOS `17.5`. Esses valores podem ser alterados no `.env` (`SAUCE_APP`, `SAUCE_DEVICE_NAME`, `SAUCE_PLATFORM_VERSION`).

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

## CI — GitHub Actions + SauceLabs

O workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) executa a suíte no
SauceLabs a cada push na branch `ci`. Também pode ser disparado manualmente em
**Actions → Mobile CI - SauceLabs → Run workflow**, escolhendo a suíte e o device.

### Secrets e variáveis

Em **Settings → Secrets and variables → Actions** do repositório:

| Nome | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `SAUCE_USERNAME` | secret | sim | Usuário do SauceLabs |
| `SAUCE_ACCESS_KEY` | secret | sim | Access key do SauceLabs |
| `SAUCE_REGION` | variable | não | `us-west-1` (padrão) ou `eu-central-1` |
| `SAUCE_APPIUM_VERSION` | variable | não | Versão do Appium no Sauce (padrão `2.11.3`) |

Sem os dois secrets o pipeline falha na primeira etapa com uma mensagem explícita.

### O que o pipeline faz

1. `npm ci`
2. Baixa o `LojaEBAC-sim.zip` do repositório oficial da EBAC
3. Envia o app para o Sauce Storage (`scripts/sauce-upload.mjs`)
4. Executa o `checkout.test.js` no SauceLabs (padrão: iPhone 15 Simulator, iOS 17.5)
5. Baixa vídeo e logs da sessão (`scripts/sauce-artifacts.mjs`)
6. Publica `sauce-artifacts/` e `allure-results/` como artifacts e escreve o link do job no resumo da execução

O vídeo fica em `sauce-artifacts/video.mp4` (artifact `sauce-artifacts-<run>`) e o job
em `https://app.saucelabs.com/tests/<session-id>`.

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

- Repositório (público): <https://github.com/andre-sostenes/ebac-store-mobile-tests>
- Branch utilizada: **`ci`**
- Pipeline: <https://github.com/andre-sostenes/ebac-store-mobile-tests/actions/workflows/ci.yml>
- Vídeo da execução: artifact `sauce-artifacts-<run>` (ou link do job no SauceLabs)

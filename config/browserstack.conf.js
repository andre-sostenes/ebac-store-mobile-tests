import { generalConf } from './general.conf.js'

/**
 * Configuração para execução no BrowserStack App Automate (devices reais).
 *
 * O app deve ser enviado antes com `npm run bs:upload`, que imprime o
 * BROWSERSTACK_APP_URL (bs://...). Para devices reais use o LojaEBAC.ipa —
 * o LojaEBAC-sim.zip é um build x86_64 de simulador e não é aceito aqui.
 */
const deviceName = process.env.BROWSERSTACK_DEVICE_NAME || 'iPhone 15'
const osVersion = process.env.BROWSERSTACK_OS_VERSION || '17'

export let browserstackConf = {
    runner: 'local',
    user: process.env.BROWSERSTACK_USERNAME,
    key: process.env.BROWSERSTACK_ACCESS_KEY,
    protocol: 'https',
    hostname: 'hub.browserstack.com',
    port: 443,
    path: '/wd/hub',
    capabilities: [
        {
            platformName: 'iOS',
            'appium:automationName': 'XCUITest',
            'appium:app': process.env.BROWSERSTACK_APP_URL,
            'appium:deviceName': deviceName,
            'appium:platformVersion': osVersion,
            'appium:autoAcceptAlerts': true,
            'appium:newCommandTimeout': 600,
            'appium:wdaLaunchTimeout': 180000,
            'bstack:options': {
                os: 'ios',
                deviceName,
                osVersion,
                projectName: process.env.BROWSERSTACK_PROJECT || 'EBAC Store',
                buildName: process.env.BROWSERSTACK_BUILD || 'ebac-store-ios',
                sessionName: process.env.BROWSERSTACK_NAME || 'EBAC Store - Checkout iOS',
                deviceOrientation: 'portrait',
                video: true,
                debug: true,
                networkLogs: true
            }
        }
    ],
    ...generalConf
}

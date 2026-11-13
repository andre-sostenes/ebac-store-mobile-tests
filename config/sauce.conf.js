import { generalConf } from './general.conf.js'

const regions = {
    'us-west-1': {
        ondemand: 'ondemand.us-west-1.saucelabs.com',
        api: 'api.us-west-1.saucelabs.com'
    },
    'eu-central-1': {
        ondemand: 'ondemand.eu-central-1.saucelabs.com',
        api: 'api.eu-central-1.saucelabs.com'
    }
}

const region = process.env.SAUCE_REGION || 'us-west-1'
const endpoints = regions[region] || regions['us-west-1']

/**
 * Configuração para execução na device farm SauceLabs.
 *
 * Por padrão usa o build de simulador (LojaEBAC-sim.zip), que deve estar
 * previamente enviado para o Sauce Storage. Para device real, defina:
 *   SAUCE_APP=storage:filename=LojaEBAC.ipa
 *   SAUCE_DEVICE_NAME="iPhone 15"
 *   SAUCE_PLATFORM_VERSION=17
 */
export let sauceConf = {
    runner: 'local',
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    hostname: endpoints.ondemand,
    port: 443,
    path: '/wd/hub',
    capabilities: [
        {
            platformName: 'iOS',
            'appium:app': process.env.SAUCE_APP || 'storage:filename=LojaEBAC-sim.zip',
            'appium:deviceName': process.env.SAUCE_DEVICE_NAME || 'iPhone 15 Simulator',
            'appium:platformVersion': process.env.SAUCE_PLATFORM_VERSION || '17.5',
            'appium:automationName': 'XCUITest',
            'appium:autoAcceptAlerts': true,
            'appium:newCommandTimeout': 240,
            'appium:wdaLaunchTimeout': 180000,
            'sauce:options': {
                build: process.env.SAUCE_BUILD || 'ebac-store-ios',
                name: process.env.SAUCE_NAME || 'EBAC Store - Checkout iOS',
                appiumVersion: process.env.SAUCE_APPIUM_VERSION || '2.11.3',
                deviceOrientation: 'PORTRAIT',
                tags: ['ebac', 'ios', 'appium', 'checkout']
            }
        }
    ],
    ...generalConf
}

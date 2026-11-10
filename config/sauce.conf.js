import { generalConf } from './general.conf.js'

const regions = {
    'us-west-1': 'ondemand.us-west-1.saucelabs.com',
    'eu-central-1': 'ondemand.eu-central-1.saucelabs.com'
}

const region = process.env.SAUCE_REGION || 'us-west-1'

export let sauceConf = {
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    hostname: regions[region] || regions['us-west-1'],
    port: 443,
    path: '/wd/hub',
    capabilities: [
        {
            platformName: 'iOS',
            'appium:app': process.env.SAUCE_APP || 'storage:filename=LojaEBAC.ipa',
            'appium:deviceName': process.env.SAUCE_DEVICE_NAME || 'iPhone 15.*',
            'appium:platformVersion': process.env.SAUCE_PLATFORM_VERSION || '17',
            'appium:automationName': 'XCUITest',
            'sauce:options': {
                build: process.env.SAUCE_BUILD || 'ebac-store-ios',
                name: process.env.SAUCE_NAME || 'EBAC Store - Checkout iOS',
                deviceOrientation: 'PORTRAIT',
                appiumVersion: '2.0.0'
            }
        }
    ],
    ...generalConf
}

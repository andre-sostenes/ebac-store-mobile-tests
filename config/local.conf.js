import path from 'node:path'
import { generalConf } from './general.conf.js'

const appPath = process.env.APP_PATH
    ? path.resolve(process.env.APP_PATH)
    : path.resolve(process.cwd(), 'app', 'LojaEBAC-sim.app')

export let localConf = {
    runner: 'local',
    hostname: '127.0.0.1',
    port: 4723,
    path: '/',
    capabilities: [
        {
            platformName: 'iOS',
            'appium:deviceName': process.env.IOS_DEVICE_NAME || 'iPhone 15',
            'appium:platformVersion': process.env.IOS_PLATFORM_VERSION || '17.2',
            'appium:automationName': 'XCUITest',
            'appium:app': appPath,
            'appium:autoAcceptAlerts': true,
            'appium:newCommandTimeout': 180,
            'appium:wdaLaunchTimeout': 180000
        }
    ],
    ...generalConf
}

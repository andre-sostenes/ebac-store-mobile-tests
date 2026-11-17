import { specsConf } from './specs.conf.js'
import { suitesConf } from './suites.conf.js'
import { reportersConf } from './reports.conf.js'
import { hooksConf } from './hooks.conf.js'

export let generalConf = {
    maxInstances: 1,
    logLevel: process.env.LOG_LEVEL || 'info',
    waitforTimeout: Number(process.env.WAITFOR_TIMEOUT || 60000),
    connectionRetryTimeout: 180000,
    connectionRetryCount: 3,
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: Number(process.env.MOCHA_TIMEOUT || 1200000)
    },
    ...specsConf,
    ...suitesConf,
    ...reportersConf,
    ...hooksConf
}

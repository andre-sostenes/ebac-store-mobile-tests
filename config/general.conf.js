import { specsConf } from './specs.conf.js'
import { suitesConf } from './suites.conf.js'
import { reportersConf } from './reports.conf.js'
import { hooksConf } from './hooks.conf.js'

export let generalConf = {
    maxInstances: 1,
    logLevel: process.env.LOG_LEVEL || 'info',
    waitforTimeout: 15000,
    connectionRetryTimeout: 180000,
    connectionRetryCount: 3,
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: 180000
    },
    ...specsConf,
    ...suitesConf,
    ...reportersConf,
    ...hooksConf
}

import 'dotenv/config'
import { localConf } from './local.conf.js'
import { sauceConf } from './sauce.conf.js'

const environments = {
    local: localConf,
    saucelabs: sauceConf
}

const environment = (process.env.ENVIRONMENT || 'local').toLowerCase()
const config = environments[environment]

if (!config) {
    throw new Error(
        `Ambiente "${environment}" inválido. Use ENVIRONMENT=local ou ENVIRONMENT=saucelabs.`
    )
}

export { config }

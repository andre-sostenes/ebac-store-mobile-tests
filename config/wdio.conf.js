import 'dotenv/config'
import { localConf } from './local.conf.js'
import { sauceConf } from './sauce.conf.js'
import { browserstackConf } from './browserstack.conf.js'

const environments = {
    local: localConf,
    saucelabs: sauceConf,
    browserstack: browserstackConf
}

const environment = (process.env.ENVIRONMENT || 'local').toLowerCase()
const config = environments[environment]

if (!config) {
    throw new Error(
        `Ambiente "${environment}" inválido. Use ENVIRONMENT=local, saucelabs ou browserstack.`
    )
}

export { config }

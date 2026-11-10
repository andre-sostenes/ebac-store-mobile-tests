export let reportersConf = process.env.REPORTER === 'true'
    ? {
        reporters: [
            'spec',
            ['allure', {
                outputDir: 'allure-results',
                disableWebdriverStepsReporting: true,
                disableWebdriverScreenshotsReporting: false
            }]
        ]
    }
    : {
        reporters: ['spec']
    }

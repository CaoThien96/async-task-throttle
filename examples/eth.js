const fetch = require('node-fetch')
const AsyncTaskThrottle = require('../dist/index')

const apiKey = 'EAFD3XBVRUFAP8ASBSJPRD9MPJ129IM598'

const routers = Array(100).fill('0x4fabb145d64652a948d72533023f6e7a623c7c53')

const callApi = (router, queueTime) => {
    const throtled = Date.now() - queueTime
    return fetch(`https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${router}&apikey=${apiKey}`, { cache: "no-cache" })
        .then(r => r.json())
        .then(async (r) => {
            const responseTime = Date.now() - queueTime - throtled
            if (r.status === '1') {
                console.log('success: ', { throtled, responseTime })
            } else {
                console.log('failed:  ', { throtled, responseTime }, r)
            }
        })
}

const throttleTask = AsyncTaskThrottle.default.create(callApi, apiKey ? 5 : 1, apiKey ? 1000 : 5000)

Promise.all(routers.map((router) => {
    const queueTime = Date.now()
    throttleTask(router, queueTime)
}))
// const throttledQueue = require('../dist/throttledQueue')
const fetch = require('node-fetch')
const AsyncTaskThrottle = require('../dist/index')

const apiKey = ''
// const apiKey = 'HIM1VEHR1WFAFIM8GUX4BCKSANXB83YMZ9'
const routers = Array(1000).fill('0x10ED43C718714eb63d5aA57B78B54704E256024E')
const callApi = (router, queueTime) => {
    const throtled = Date.now() - queueTime
    return fetch(`https://api.bscscan.com/api?module=contract&action=getsourcecode&address=${router}&apikey=${apiKey}`, { cache: "no-cache" })
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

// const main = async () => {
//     const queueTime = Date.now()
//     for (let index = 0; index < routers.length; index++) {
//         await new Promise(resolve => setTimeout(resolve, index === 0 ? 0 : Math.random() * 8000))
//         throttleTask(routers[index], queueTime)
//     }
// }
// main()
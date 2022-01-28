const AsyncTaskThrottle = require('../../dist/index')

describe('throttled-queue', function () {
  it('should queue all fns', async function () {
    const requestsPerInterval = 5
    const interval = 1000
    const requestLimit = 50
    let numRequests = 0
    jest.setTimeout((requestLimit * interval) / requestsPerInterval)

    const task = async () => {
      numRequests++
    }
    const throttleTask = AsyncTaskThrottle.default.create(
      task,
      requestsPerInterval,
      interval
    )

    await Promise.all(
      Array(requestLimit)
        .fill(0)
        .map(() => throttleTask())
    )
    expect(numRequests).toBe(requestLimit)
  })

  it('should queue the fn and honor the interval', async function () {
    const requestsPerInterval = 1
    const interval = 100
    const requestLimit = 50
    let lastIntervalStart = process.hrtime.bigint()
    let numRequests = 0
    let numRequestsPerInterval = 0
    jest.setTimeout((requestLimit * interval) / requestsPerInterval + 10000) 

    const task = async () => {
      if (process.hrtime.bigint() - lastIntervalStart > interval * 1000000) {
        lastIntervalStart = process.hrtime.bigint()
        numRequestsPerInterval = 0
      }
      if (++numRequestsPerInterval > requestsPerInterval) {
        throw new Error('Did not honor interval.')
      }
      numRequests++
    }
    const throttleTask = AsyncTaskThrottle.default.create(
      task,
      requestsPerInterval,
      interval
    )

    await Promise.all(
      Array(requestLimit)
        .fill(0)
        .map(() => throttleTask())
    )
    expect(numRequests).toBe(requestLimit)
  })

  it('should queue the fn and honor the interval with multiple requests per interval', async function () {
    const requestsPerInterval = 3
    const interval = 1000
    const requestLimit = 50
    jest.setTimeout((requestLimit * interval) / requestsPerInterval)
    let lastIntervalStart = process.hrtime.bigint()
    let numRequests = 0
    let numRequestsPerInterval = 0

    const task = async () => {
      if (process.hrtime.bigint() - lastIntervalStart > interval * 1000000) {
        lastIntervalStart = process.hrtime.bigint()
        numRequestsPerInterval = 0
      }
      if (++numRequestsPerInterval > requestsPerInterval) {
        throw new Error('Did not honor interval.')
      }
      numRequests++
    }
    const throttleTask = AsyncTaskThrottle.default.create(
      task,
      requestsPerInterval,
      interval
    )

    await Promise.all(
      Array(requestLimit)
        .fill(0)
        .map(() => throttleTask())
    )
    expect(numRequests).toBe(requestLimit)
  })

  it('returns a promise that resolves when the fn executes', async function () {
    const requestsPerInterval = 5
    const interval = 1000
    const requestLimit = 50
    const numbers = Array(requestLimit).fill(0).map((_,i)=>i)
    jest.setTimeout(
      (numbers.length * interval) / requestsPerInterval + numbers.length * 1000
    )
    const task = async (number: any) =>
      new Promise((resolve) => setTimeout(() => resolve(number), Math.random()*200))
    const throttleTask = AsyncTaskThrottle.default.create(
      task,
      requestsPerInterval,
      interval
    )
    const results = await Promise.all(
      numbers.map((number) => throttleTask(number))
    )
    if (!numbers.every((number, index) => results[index] === number)) {
      throw new Error('Results do not match the inputs.')
    }
  })
})

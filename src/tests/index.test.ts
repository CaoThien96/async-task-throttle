import { spawn, SpawnOptionsWithoutStdio } from 'child_process'
import AsyncTaskThrottle from '../index'

describe('AsyncTaskThrottle Testing', () => {
  it('check resolve and reject', async () => {
    let flag = true
    let successCount = 0
    let failCount = 0
    const requestsPerInterval = 5
    const interval = 1000
    const requestLimit = 100
    jest.setTimeout(
      (requestLimit * interval) / requestsPerInterval + requestLimit * 1000
    )
    const task = () =>
      new Promise((resolve, reject) => {
        if (flag) {
          flag = false
          return resolve('')
        } else {
          flag = true
          return reject()
        }
      })
    const throttleTask = AsyncTaskThrottle.create(task, requestsPerInterval, interval)
    for (let i = 0; i < requestLimit; i++) {
      await throttleTask()
        .then(() => successCount++)
        .catch(() => failCount++)
    }
    expect(successCount).toBe(failCount)
  })
})

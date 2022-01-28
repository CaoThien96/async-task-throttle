import {
  setDriftlessTimeout,
} from 'driftless';

export type ITask<R = any> = (...args: any[]) => Promise<R>
export interface IAsyncTaskOptions {
  args: any[]
  resolve: (value?: unknown) => void
  reject: (reason?: any) => void
}

export default class AsyncTaskThrottle<S extends ITask> {
  public static create<T extends ITask>(
    task: T,
    rateLimitCount?: number,
    rateLimitDuration?: number,
    max?: number
  ) {
    const throttle = new AsyncTaskThrottle(task, rateLimitCount, rateLimitDuration, max)
    function asyncTask(...args: any[]) {
      return new Promise((resolve, reject) => {
        throttle.push({
          args,
          reject,
          resolve,
        })
      })
    }
    return asyncTask as T
  }

  private _queue: IAsyncTaskOptions[] = []
  private _queueLength: number
  private _workerCount: number
  private _task: S
  private _workingCount: number
  private _workingCountProcessing: number
  private _rateLimitDuration: number

  public constructor(
    task: S,
    rateLimitCount?: number,
    rateLimitDuration?: number,
    queueLength?: number
  ) {
    this._task = task
    this._workerCount = rateLimitCount || 1
    this._rateLimitDuration = rateLimitDuration || 5000
    this._queueLength = queueLength || Infinity
    this._workingCount = 0
    this._workingCountProcessing = 0
  }

  public getWorkingCount() {
    return this._workingCount
  }

  public create() {
    const asyncTask = (...args: any[]) => {
      return new Promise((resolve, reject) => {
        this.push({
          args,
          reject,
          resolve,
        })
      })
    }
    return asyncTask as S
  }

  public push(options: IAsyncTaskOptions) {
    if (this._queue.length < this._queueLength) {
      this._queue.push(options)
      this.work()
    } else {
      options.reject(new Error('It is exceeding load.'))
    }
  }

  private work() {
    if (this._workingCount < this._workerCount) {
      const options = this._queue.shift()
      if (options) {
        this._workingCount++
        this._workingCountProcessing++
        this._task(...options.args)
          .then((value) => {
            options.resolve(value)
          })
          .catch((error) => {
            options.reject(error)
          })
          .then(() => {
            this._workingCountProcessing--
            if (this._workingCountProcessing === 0) {
              setDriftlessTimeout(() => {
                this._workingCount = 0
                let length = Math.min(this._workerCount, this._queue.length)
                for (let index = 0; index < length; index++) {
                  this.work()
                }
              }, this._rateLimitDuration)
            }
          })
      }
    }
  }
}

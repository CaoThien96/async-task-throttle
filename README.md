[![npm version](https://badge.fury.io/js/async-task-throttle.svg)](https://www.npmjs.com/async-task-throttle)
[![Build Status](https://travis-ci.org/breeze2/async-task-throttle.svg?branch=master)](https://travis-ci.org/breeze2/async-task-throttle)
[![Coverage Status](https://coveralls.io/repos/github/breeze2/async-task-throttle/badge.svg?branch=master)](https://coveralls.io/github/breeze2/async-task-throttle?branch=master)

# async-task-throttle-on-response
> We refer lib https://github.com/breeze2/async-task-throttle
> Also, we modify async-task-throttle to support rate limit on response

## Install

```cmd
$ yarn add async-task-throttle
```

## Usage

### Sample

```js
import AsyncTaskThrottle from 'async-task-throttle'


function task (url) {
    return fetch(url)
}

const throttleTask = AsyncTaskThrottle.create(task, 1, 5000) // at most 1 requests per 5 second. Note 5s counted from the time of response

// use `throttleTask` just like `task`
throttleTask('https://github.com/breeze2/markdown-it-all').then(value => {
    console.log(value)
}).catch(error => {
    console.error(error)
})

```

### Interface

#### AsyncTaskThrottle.create

```js
function AsyncTaskThrottle.create(
    task: T extends (...args: any[]) => Promise<any>,
    rateLimitCount?: number = 1,
    rateLimitDuration?: number = 5000,
    max: number = Infinity
): T

```

* task: the async task function.
* rateLimitCount: defualt 1, at the same moment, up to `rateLimitCount` tasks are runing, others are in the waiting queue.
* rateLimitDuration: default 5000, make `rateLimitCount` request every `rateLimitDuration`. 
> Note: Timer from last asynchronous task resolution time
* max: defualt Infinity, when the length of waiting queue is greater than `max`, late tasks will be rejected instantly.


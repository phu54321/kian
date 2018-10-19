function getCurrentTime () {
  return (new Date()).getTime() / 1000
}

const maxInterval = 120

export default class ExponentialSmoother {
  constructor () {
    this.logs = []
    this.startTime = this.lastTime = getCurrentTime()
    this.elapsedTime = 0
  }

  update (newPercent) {
    const timeSpent = Math.min(
      getCurrentTime() - this.lastTime,
      maxInterval
    )
    this.logs.push([timeSpent, newPercent])
    this.logs = this.logs.slice(-200)
    this.lastTime = getCurrentTime()
    this.elapsedTime = getCurrentTime() - this.startTime
  }

  get slope () {
    if (this.logs.length < 2) return 1

    let totTime = 0
    let percentChange = 0

    for (let i = 1; i < this.logs.length; i++) {
      const r = Math.pow(1.005, i)
      totTime += r * this.logs[i - 1][0]
      percentChange += r * (this.logs[i][1] - this.logs[i - 1][1])
    }
    if (totTime < 1) return 1
    return Math.max(percentChange / totTime, 1e-6)
  }
}

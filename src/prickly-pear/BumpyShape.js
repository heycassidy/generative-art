import { seededRandomNormal } from "../helpers/math.js"

export default class BumpyShape {
  constructor(path, settings) {
    this.path = path

    this.settings = {...{
      subdivisionAmount: 20,
      startingIndex: 0,
      endingIndex: -1,
      bumpHeightFactor: 0.003,
      bumpHeightVariance: 0.002,
      bumpTightnessFactor: 0.025,
      bumpTightnessVariance: 0,
      bumpDistributionVariance: 0,
      normalSign: -1,
      source: null
    }, ...settings }

    return this.bumpify()
  }

  bumpify() {
    const { path } = this
    const {
      subdivisionAmount,
      startingIndex,
      endingIndex,
      bumpHeightFactor,
      bumpHeightVariance,
      bumpTightnessFactor,
      bumpTightnessVariance,
      bumpDistributionVariance,
      normalSign,
      source
    } = this.settings

    let startingSegment = path.segments.slice(startingIndex)[0]
    let endingSegment = path.segments.slice(endingIndex)[0]

    let startingOffset = path.getOffsetOf(startingSegment.point)
    let endingOffset = path.getOffsetOf(endingSegment.point)

    if (endingOffset === 0) { endingOffset = path.length }

    let randomBumpHeightFactor = seededRandomNormal({
      expectedValue: bumpHeightFactor,
      standardDeviation: bumpHeightVariance,
      source
    })

    let randomBumpTightnessFactor = seededRandomNormal({
      expectedValue: bumpTightnessFactor,
      standardDeviation: bumpTightnessVariance,
      source
    })

    // subdivide
    subdivide: for (let n = 1; n < subdivisionAmount; n++) {
      let offset = Math.abs((startingOffset - endingOffset) * n / subdivisionAmount) + startingOffset + seededRandomNormal({
        expectedValue: 0,
        standardDeviation: bumpDistributionVariance * path.length,
        source
      })()
      
      let point = path.getPointAt(offset)
      let location = path.getLocationOf(point)

      let tooClose = false

      path.segments.map(segment => path.getOffsetOf(segment.point)).forEach(existingOffset => {
        if (Math.abs(offset - existingOffset) <= (path.length / subdivisionAmount) * 0.95) {
          tooClose = true
          return
        }
      })

      if (!tooClose) { path.divideAt(location) }
    }

    let segments = path.segments.slice(startingSegment.index, endingSegment.index === startingSegment.index ? path.segments.length : endingSegment.index)

    segments.forEach(segment => {
      let offset = segment.location.offset
      let normal = segment.location.normal.multiply(path.length * normalSign * Math.abs(randomBumpHeightFactor()))
      let bumpTightnessFactor = randomBumpTightnessFactor()

      path.divideAt(offset + path.length * bumpTightnessFactor)
      path.divideAt(offset - path.length * bumpTightnessFactor)

      segment.point = segment.point.add(normal)
    })

    return path
  }

}
import { randomUniform, randomInt, randomNormal } from "d3-random"


export const TAU = Math.PI * 2

export const mod = (n, a) => ((n % a) + a) % a
export const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

export const cartesianToPolar = (x, y) => {
  let r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
  let theta = Math.atan2(y, x)

  return { r, theta }
}

export const polarToCartesian = (r, theta) => {
  let x = r * Math.cos(theta)
  let y = r * Math.sin(theta)

  return { x, y }
}

export const seededRandomUniform = ({ min, max, source }) => {
  if (!!source) {
    return randomUniform.source(source)(min, max)
  } else {
    return randomUniform(min, max)
  }
}

export const seededRandomInteger = ({ min, max, source }) => {
  if (!!source) {
    return randomInt.source(source)(min, max)
  } else {
    return randomInt(min, max)
  }
}

export const seededRandomNormal = ({ expectedValue, standardDeviation, source }) => {
  if (!!source) {
    return randomNormal.source(source)(expectedValue, standardDeviation)
  } else {
    return randomNormal(expectedValue, standardDeviation)
  }
}

export const inchToPx = (inch, DPI) => inch * DPI
export const degreesToRadians = (deg) => deg * (TAU / 360)
export const radiansToDegrees = (rad) => rad * (360 / TAU)
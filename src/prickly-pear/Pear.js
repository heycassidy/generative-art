import { clamp, TAU } from "../helpers/math.js"
import Branch from "./Branch.js"

class Pear extends Branch {
  constructor(p5, baseX, baseY, angle, length, width) {
    super(p5, baseX, baseY, angle, length)
    this._width = width
    this._points = this.points
    this._colors = this.colors
  }

  get width() {
    return this._width
  }

  get points() {
    const { p5 } = this

    let width = this.width
    let length = this.length

    let baseWidth = clamp(p5.randomGaussian(0.1, 0.1), 0, 0.1)
    let baseTaperWidth = 0.2
    let baseTaperHeight = 0.01
    let topRoundness = clamp(p5.randomGaussian(0.2, 0.1), 0.2, 0.3)
    let sideHeight = p5.random(0.6, 0.65)
    let sideRoundness = 0.25
    let leftXVariance = clamp(p5.randomGaussian(0, 40), 0, width / 6)
    let rightXVariance = clamp(p5.randomGaussian(0, 40), 0, width / 6)

    return [
      [0, 0, 0, 0, 0, 0],

      [
        -(width * baseTaperWidth), -(length * baseTaperHeight),
        -(width * baseWidth), 0,
        -(width * baseWidth), 0
      ],

      [
        -(width * 0.5) - leftXVariance, -(length * sideHeight + length * sideRoundness),
        -(width * 0.5) - leftXVariance, -(length * sideHeight - length * sideRoundness),
        -(width * 0.5) - leftXVariance, -(length * sideHeight),
      ],

      [
        width * topRoundness,
        -length, -(width * topRoundness),
        -length, 0, -length
      ],

      [
        (width * 0.5) + rightXVariance, -(length * sideHeight - length * sideRoundness),
        (width * 0.5) + rightXVariance, -(length * sideHeight + length * sideRoundness),
        (width * 0.5) + rightXVariance, -(length * sideHeight),
      ],

      [
        (width * baseWidth), 0,
        (width * baseTaperWidth), -(length * baseTaperHeight),
        (width * baseWidth), 0
      ],
    ]
  }

  get colors() {
    const lightness = this.p5.random(60, 70)

    return {
      surface: [80, 42, lightness],
      get edge() {
        return [this.surface[0] + 5, this.surface[1], this.surface[2] - 6]
      },
    }
  }

  calculateNormal(i, t = 0.5) {
    let points = this._points

    let currentAnchor = points[i].slice(-2)
    let currentControl = points[i].slice(0, 2)
    let nextAnchor = points[i + 1].slice(-2)
    let nextControl = points[i + 1].slice(-4, -2)

    let length = 30
    let x = this.p5.bezierPoint(currentAnchor[0], currentControl[0], nextControl[0], nextAnchor[0], t)
    let y = this.p5.bezierPoint(currentAnchor[1], currentControl[1], nextControl[1], nextAnchor[1], t)
    let tx = this.p5.bezierTangent(currentAnchor[0], currentControl[0], nextControl[0], nextAnchor[0], t)
    let ty = this.p5.bezierTangent(currentAnchor[1], currentControl[1], nextControl[1], nextAnchor[1], t)
    let a = Math.atan2(ty, tx) + (TAU * 0.25)

    return { x, y, tx: Math.cos(a) * length + x, ty: Math.sin(a) * length + y, angle: a }
  }

  branchNormal(startingPoint) {
    return this.calculateNormal(startingPoint, this.p5.randomGaussian(0.35, 0.2))
  }

  draw() {
    let { x, y } = this.start
    let angle = this.angle
    let points = this._points

    this.p5.push()
    this.p5.fill(this._colors.surface)
    this.p5.strokeWeight(4)
    this.p5.stroke(this._colors.edge)
    this.p5.translate(x, y)
    this.p5.rotate((0.25 * TAU) + (angle * TAU))

    this.p5.beginShape()
    this.p5.vertex(...points[0])

    for (let i = 0; i < points.length - 1; i++) {
      let currentControl = points[i].slice(0, 2)
      let nextAnchor = points[i + 1].slice(-2)
      let nextControl = points[i + 1].slice(-4, -2)
      this.p5.bezierVertex(...currentControl, ...nextControl, ...nextAnchor)
    }

    this.p5.endShape(this.p5.CLOSE)
    this.p5.pop()
  }
}


export default Pear
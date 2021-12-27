import { clamp, radiansToDegrees, degreesToRadians, seededRandomUniform, seededRandomNormal } from "../helpers/math.js"
import Branch from "./Branch.js"

class Cladode extends Branch {
  constructor(paper, settings) {
    super(paper, settings)

    this.settings = {...{
      width: 50,
    }, ...settings }

    this._segments = this.segments
    this._colors = this.colors
    this._nextGrowthLocation = this.nextGrowthLocation
  }

  get width() {
    return this.settings.width
  }

  get segments() {
    const { source } = this.settings

    let width = this.width
    let length = this.length

    let baseWidth = seededRandomUniform({ min: 0.1, max: 0.15, source })()
    let sideHeight = seededRandomUniform({ min: 0.5, max: 0.65, source })()

    let leftWidthVariance = clamp(seededRandomNormal({
      expectedValue: 0,
      standardDeviation: width * 0.1,
      source
    })(), -width * 0.1, width * 0.2)

    let rightWidthVariance = clamp(seededRandomNormal({
      expectedValue: 0,
      standardDeviation: width * 0.1,
      source
    })(), -width * 0.1, width * 0.2)

    return [
      [0, 0],
      [width * baseWidth, 0],
      [(width * 0.5) + leftWidthVariance, -length * sideHeight],
      [0, -length],
      [-(width * 0.5) + rightWidthVariance, -length * sideHeight],
      [-width * baseWidth, 0],
    ]
  }

  get colors() {
    const paper = this.paper
    const { source } = this.settings
    
    const hue = 80
    const saturation = 0.6
    const brightness = seededRandomUniform({ min: 0.6, max: 0.7, source })()

    return {
      surface: new paper.Color({ hue, saturation, brightness }),
      edge: new paper.Color({ hue: hue + 5, saturation, brightness: brightness - 0.1 })
    }
  }

  growthLocation(t = 0.5, length = 300) {
    const paper = this.paper
    const path = this.mainShape
    let cladodeLength = this.length

    let offset = path.length * t
    let normal = path.getNormalAt(offset).multiply(length);
    let angle = degreesToRadians(normal.angle)
    let point = path.getPointAt(offset);

    // Overlap the cladodes a bit 
    point = new paper.Point([
      cladodeLength * 0.05 * Math.cos(angle) + point.x,
      cladodeLength * 0.05 * Math.sin(angle) + point.y,
    ])

    const visualize = () => {
      new paper.Path({
          segments: [point, point.subtract(normal)],
          strokeColor: 'red',
          strokeWidth: 4
      });
    }

    return { point, angle: normal.angle, visualize }
  }

  randomGrowthLocation(range) {
    const [min, max] = range
    const { source } = this.settings
    const t = seededRandomUniform({ min, max, source })()

    return this.growthLocation(t)
  }

  get nextGrowthLocation() {
    return this._nextGrowthLocation
  }

  set nextGrowthLocation(growthLocation) {
    this._nextGrowthLocation = growthLocation
  }

  get mainShape() {
    const paper = this.paper
    const { start } = this
    const { angle } = this.settings

    let path = new paper.Path({
      segments: this._segments,
      fillColor: this._colors.surface,
      strokeColor: this._colors.edge,
      strokeWidth: 10,
      closed: true,
    });

    path.pivot = path.bounds.bottomCenter
    path.position = start

    path.rotate(radiansToDegrees(angle))
    path.smooth({ type: 'continuous', from: 1, to: 5 })
    path.sendToBack()

    return path
  }

  draw() {
    this.mainShape
  }
}


export default Cladode
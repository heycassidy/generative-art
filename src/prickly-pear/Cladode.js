import { TAU, clamp, radiansToDegrees, degreesToRadians, seededRandomUniform, seededRandomNormal, polarToCartesian } from "../helpers/math.js"
import Branch from "./Branch.js"

class Cladode extends Branch {
  constructor(paper, settings) {
    super(paper, settings)

    this.settings = {...{
      width: 50,
    }, ...settings }

    this._segments = this.segments
    this._colors = this.colors

    this.group = new paper.Group()

    this.mainShape = this.computeMainShape()
    this.surfaceTubercles = this.computeSurfaceTubercles()
    this.edgeTubercles = this.computeEdgeTubercles()

    this.init()
  }

  get width() {
    return this.settings.width
  }

  get segments() {
    const { source } = this.settings

    let width = this.width
    let length = this.length

    let baseWidth = seededRandomUniform({ min: 0.08, max: 0.15, source })()
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
    const brightness = 0.6

    return {
      surface: new paper.Color({ hue, saturation, brightness }),
      edge: new paper.Color({ hue: hue + 5, saturation, brightness: brightness - 0.1 }),
      tubercles: new paper.Color({ hue: 60, saturation: 0.80, brightness: 0.35 })
    }
  }

  growthLocation(t = 0.5, length = 300) {
    const paper = this.paper
    const path = this.mainShape
    let cladodeLength = this.length

    let offset = path.length * t
    let normal = path.getNormalAt(offset).multiply(length)
    let angle = degreesToRadians(normal.angle)
    let point = path.getPointAt(offset)

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

  computeSurfaceTubercles() {
    const paper = this.paper
    const { source } = this.settings
    const { mainShape } = this
    const { bounds } = mainShape

    let tubercles = new paper.CompoundPath({
      name: 'surfaceTubercles',
      fillColor: this._colors.surface,
      blendMode: 'multiply'
    })
    tubercles.remove()

    let tubercle = new paper.Path.Circle({ radius: mainShape.length * 0.005 })
    tubercle.remove()

    let tubercleDefinition = new paper.SymbolDefinition(tubercle)

    for (let i = 0; i < 300; i += 1) {
      let theta = i * degreesToRadians(137.5)
      let r = bounds.height * 0.08 * Math.sqrt(i)
      let cartesian = polarToCartesian(r, theta)

      if (cartesian.y > bounds.bottom) { continue }

      let point = [
        seededRandomNormal({ expectedValue: cartesian.x, standardDeviation: mainShape.length * 0.001, source })(),
        seededRandomNormal({ expectedValue: cartesian.y, standardDeviation: mainShape.length * 0.001, source })(),
      ]

      if (mainShape.contains([...point])) {
        let instance = tubercleDefinition.place()
        instance.position = [...point]
        instance.remove()
        tubercles.addChild(instance)
      }
    }

    return tubercles
  }
  computeEdgeTubercles() {
    const paper = this.paper
    const { source } = this.settings
    const { mainShape } = this
    const { bounds } = mainShape

    let tubercles = new paper.CompoundPath({
      name: 'edgeTubercles',
      fillColor: this._colors.surface,
      blendMode: 'multiply'
    })
    tubercles.remove()

    let tubercle = new paper.Path.Circle({ radius: mainShape.length * 0.005 })
    tubercle.remove()

    let tubercleDefinition = new paper.SymbolDefinition(tubercle)

    let distanceBetweenEdgePoints = seededRandomNormal({
      expectedValue: 0.08,
      standardDeviation: 0.01,
      source
    })

    // Draw edge tubercles
    for (let i = 0; i <= 1; i += distanceBetweenEdgePoints()) {
      let instance = tubercleDefinition.place()
      instance.position = mainShape.getPointAt(mainShape.length * i)
      instance.remove()
      tubercles.addChild(instance)
    }

    return tubercles
  }
  get surfaceTubercles() {
    return this._surfaceTubercles
  }
  set surfaceTubercles(tubercles) {
    this._surfaceTubercles = tubercles
  }
  get edgeTubercles() {
    return this._edgeTubercles
  }
  set edgeTubercles(tubercles) {
    this._edgeTubercles = tubercles
  }

  computeMainShape() {
    const paper = this.paper

    let path = new paper.Path({
      segments: this._segments,
      closed: true,
      name: 'mainShape'
    });

    path.fillColor = this._colors.surface
    path.shadowColor = new paper.Color({ hue: 160, saturation: 1, brightness: 0.4, alpha: 1 }),
    path.shadowBlur = path.length * 0.125

    path.smooth({ type: 'continuous', from: 1, to: 5 })
    path.remove()

    return path
  }
  get mainShape() {
    return this._mainShape
  }
  set mainShape(shape) {
    this._mainShape = shape
  }

  init() {
    const { start, group } = this
    const { angle } = this.settings

    group.addChild(this.edgeTubercles)
    group.addChild(this.mainShape)
    group.addChild(this.surfaceTubercles)

    group.pivot = this.mainShape.bounds.bottomCenter
    group.position = start
    group.rotate(radiansToDegrees(angle))

    group.remove()
  }
  
  draw() {
    const { group } = this

    return group
  }
}


export default Cladode
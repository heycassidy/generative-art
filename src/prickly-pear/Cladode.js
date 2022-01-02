import { TAU, mod, clamp, radiansToDegrees, degreesToRadians, seededRandomUniform, seededRandomNormal, polarToCartesian, inchToPx } from "../helpers/math.js"
import Branch from "./Branch.js"
import BumpyShape from "./BumpyShape.js"

class Cladode extends Branch {
  constructor(paper, settings, id) {
    super(paper, settings)

    this.settings = {...{
      width: 50,
      printDPI: 300
    }, ...settings }

    this._segments = this.segments
    this.id = id

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
    const { source, palette } = this.settings
    const { mainShape } = this
    const { bounds } = mainShape

    let tubercles = new paper.CompoundPath({
      name: 'surfaceTubercles',
      fillColor: palette.dark,
      // blendMode: 'multiply'
    })
    tubercles.remove()

    let tubercle = new paper.Path.Circle({ radius: mainShape.length * 0.003 })
    tubercle.remove()

    let tubercleDefinition = new paper.SymbolDefinition(tubercle)

    for (let i = 0; i < 200; i += 1) {
      let theta = i * degreesToRadians(137.5)
      let r = bounds.height * 0.07 * Math.sqrt(i)
      let cartesian = polarToCartesian(r, theta)

      if (cartesian.y > bounds.bottom) { continue }

      let point = [
        seededRandomNormal({ expectedValue: cartesian.x, standardDeviation: mainShape.length * 0.0028, source })(),
        seededRandomNormal({ expectedValue: cartesian.y, standardDeviation: mainShape.length * 0.0028, source })(),
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

  get surfaceTubercles() {
    return this._surfaceTubercles
  }
  set surfaceTubercles(tubercles) {
    this._surfaceTubercles = tubercles
  }

  computeMainShape() {
    const paper = this.paper
    const { printDPI, palette } = this.settings

    let path = new paper.Path({
      segments: this._segments,
      closed: true,
      name: 'mainShape'
    });

    path.fillColor = palette.cactus
    // path.shadowColor = new paper.Color({ hue: 160, saturation: 1, brightness: 0.4, alpha: 1 }),
    // path.shadowBlur = path.length * 0.125
    path.strokeColor = palette.dark
    path.strokeScaling = false
    path.strokeWidth = inchToPx(0.0625, printDPI)

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
    const { start, paper } = this
    const { angle, source } = this.settings

    this.group = new paper.Group()

    this.mainShape = this.computeMainShape()
    this.mainShape = new BumpyShape(this.mainShape, { source, startingIndex: 1, endingIndex: -1 })

    this.surfaceTubercles = this.computeSurfaceTubercles()

    this.group.addChild(this.mainShape)
    this.group.addChild(this.surfaceTubercles)

    this.group.pivot = this.mainShape.bounds.bottomCenter
    this.group.position = start
    this.group.rotate(radiansToDegrees(angle))

    this.group.remove()
  }
  
  draw() {
    const { group } = this

    return group
  }
}


export default Cladode
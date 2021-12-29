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
    this.tubercles = this.computeTubercles()
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

  computeTubercles() {
    const paper = this.paper
    const { mainShape } = this
    const { source } = this.settings

    let group = new paper.Group()
    let edgeTubercles = new paper.Group()
    let surfaceTubercles = new paper.Group()
    let bounds = mainShape.bounds

    let edgeAreola = new paper.Path.Circle({
      radius: mainShape.length * 0.003,
      fillColor: this._colors.edge,
    })
    edgeAreola.remove()

    let edgeAreolaDefinition = new paper.SymbolDefinition(edgeAreola)
    
    let surfaceAreola = new paper.Path.Circle({
      radius: mainShape.length * 0.003,
      fillColor: this._colors.edge,
    })

    surfaceAreola.remove()
    let surfaceAreolaDefinition = new paper.SymbolDefinition(surfaceAreola)


    let distanceBetweenEdgePoints = seededRandomNormal({
      expectedValue: 0.05,
      standardDeviation: 0.01,
      source
    })

    // Draw edge tubercles
    for (let i = 0; i <= 1; i += distanceBetweenEdgePoints()) {
      let instance = edgeAreolaDefinition.place()
      instance.position = mainShape.getPointAt(mainShape.length * i)
      edgeTubercles.addChild(instance)
    }

    // Draw surface tubercles
    for (let i = 0; i < 300; i += 1) {
      let theta = i * degreesToRadians(137.5)
      let r = bounds.height * 0.0625 * Math.sqrt(i)
      let cartesian = polarToCartesian(r, theta)

      let point = [
        seededRandomNormal({ expectedValue: cartesian.x, standardDeviation: mainShape.length * 0.001, source })(),
        seededRandomNormal({ expectedValue: cartesian.y, standardDeviation: mainShape.length * 0.001, source })(),
      ]

      if (mainShape.contains([...point])) {
        let instance = surfaceAreolaDefinition.place()
        instance.position = [...point]
        surfaceTubercles.addChild(instance)
      }
    }

    group.addChild(edgeTubercles)
    group.addChild(surfaceTubercles)

    return group
  }
  get tubercles() {
    return this._tubercles
  }
  set tubercles(tubercles) {
    this._tubercles = tubercles
  }

  computeMainShape() {
    const paper = this.paper

    let path = new paper.Path({
      segments: this._segments,
      fillColor: this._colors.surface,
      strokeColor: this._colors.edge,
      strokeWidth: paper.view.bounds.width * 0.002,
      closed: true,
      name: 'mainShape'
    });

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

  draw() {
    const { start, group } = this
    const { angle } = this.settings

    group.addChild(this.mainShape)
    group.addChild(this.tubercles)

    group.pivot = group.bounds.bottomCenter
    group.position = start
    group.rotate(radiansToDegrees(angle))

    this.group.sendToBack()
  }
}


export default Cladode
import { seededRandomNormal } from "../helpers/math.js"
import Procedural2DSimplexNoise from '../helpers/Procedural2DSimplexNoise'

export default class Tubercle {
  constructor(paper, settings) {
    this.paper = paper

    this.settings = {...{
      center: [0, 0],
      size: 10,
      innerColor: new paper.Color({ hue: 0, saturation: 0, brightness: 0 }),
      surfaceColor: new paper.Color({ hue: 0, saturation: 0, brightness: 1 }),
      source: null
    }, ...settings }

    return this.draw()
  }

  distortCircle(circle) {
    const { source } = this.settings

    let subdivisionAmount = 2
    let curves = circle.curves

    // Subdivide
    for (let i = 0; i < subdivisionAmount; i++) {
      for (let i = 0; i < curves.length; i += 2) {
        curves[i].divideAtTime(0.5)
      }
    }

    let noise = new Procedural2DSimplexNoise({
      octaves: 1,
      frequency: 0.5,
      seedSource: source
    })

    let segments = circle.segments

    // Displace edges
    segments.forEach(segment => {
      let { x, y } = segment.location.point
      let noiseValue = noise.value(x, y)
      
      let normal = segment.location.normal.multiply(noiseValue * circle.bounds.width * 0.05)

      segment.point = segment.point.add(normal)
    })

    return circle
  }

  draw() {
    const { paper } = this
    const {
      center,
      size,
      source
    } = this.settings

    let tubercle = new paper.Group()

    let sizeVariance = seededRandomNormal({ expectedValue: 1, standardDeviation: 0.1, source })

    let outer = new paper.Path.Circle({
      center,
      radius: size * sizeVariance(),
      fillColor: new paper.Color({ hue: 0, saturation: 0, brightness: 0.6 }),
    })
    outer = this.distortCircle(outer)
    outer.remove()

    let inner = new paper.Path.Circle({
      center: center.add(0, size * -0.4 * sizeVariance()),
      radius: size * 0.4 * sizeVariance(),
      fillColor: new paper.Color({ hue: 0, saturation: 0, brightness: 0.4 }),
    })
    inner = this.distortCircle(inner)
    inner.remove()

    tubercle.addChild(outer)
    tubercle.addChild(inner)

    tubercle.blendMode = "overlay"

    return tubercle
  }
}
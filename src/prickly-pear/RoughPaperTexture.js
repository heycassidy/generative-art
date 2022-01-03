import SimplexNoise from 'simplex-noise'
import Procedural2DSimplexNoise from '../helpers/Procedural2DSimplexNoise'
import { radiansToDegrees, TAU } from '../helpers/math'

export default class RoughPaperTexture {
  constructor(bounds, settings, paper) {
    this.paper = paper
    this.bounds = bounds

    this.settings = {...{
      color: [0, 0, 100],
      resolution:  500,
      source: null
    }, ...settings }
  }

  render() {
    const paper = this.paper
    const { bounds } = this
    const {
      color,
      resolution,
      source
    } = this.settings

    const group = new paper.Group()

    let noise = new Procedural2DSimplexNoise({
      octaves: 4,
      frequency: 0.001,
      lacunarity: 10,
      xScale: 0.025,
      persistence: 1,
      seedSource: source
    })
    
    for (let x = bounds.left; x <= bounds.right; x += bounds.width / resolution) {
      for (let y = bounds.top; y <= bounds.bottom; y += bounds.width / resolution) {
        let noiseValue = noise.value(x, y)
        
        let fiber = new paper.Path.Line({
          from: [x, y],
          to: [x, y + noiseValue * (bounds.width / resolution) * 8],
          strokeWidth: (bounds.width / resolution * 0.25) * 0.05,
          strokeColor: color
        })
        
        fiber.rotation = radiansToDegrees(noiseValue * TAU)
        fiber.remove()
        group.addChild(fiber)
      }
    }

    group.remove()

    return group
  }
}
import BumpyShape from '../prickly-pear/BumpyShape.js'
import RoughPaperTexture from './RoughPaperTexture.js'

export default class BackgroundRectangle {
  constructor(paper, settings) {
    this.paper = paper

    this.settings = {...{
      from: [0, 0],
      to: [100, 100],
      fillColor: new paper.Color({ hue: 0, saturation: 0, brightness: 0 }),
      textureColor: new paper.Color({ hue: 0, saturation: 0, brightness: 1 }),
      source: null
    }, ...settings }

    this.rectangle = this.initialRectangle

    return this.processedRectangle
  }

  get initialRectangle() {
    const paper = this.paper
    const { from, to } = this.settings
    
    return new paper.Path.Rectangle({ from, to })
  }

  get processedRectangle() {
    let { rectangle } = this
    const {
      fillColor,
      textureColor,
      source
    } = this.settings

    rectangle = new BumpyShape(rectangle, {
      startingIndex: 0,
      endingIndex: 0,
      bumpHeightFactor: 0.00025,
      bumpHeightVariance: 0.00025,
      bumpTightnessFactor: 0.05,
      bumpTightnessVariance: 0.05,
      bumpDistributionVariance: 0.25,
      subdivisionAmount: 100,
      normalSign: 1,
      source
    })

    rectangle.path.fillColor = fillColor
    
    let texture = new RoughPaperTexture(rectangle.path.bounds, {
      color: textureColor,
      source
    }, this.paper)

    let group = new this.paper.Group()

    group.addChild(rectangle.render())
    // group.addChild(texture.render())
    
    return group
  }
}
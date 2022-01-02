import { randomLcg } from 'd3-random';
import LSystem from "../helpers/l-system.js"
import PricklyPearLSystemInterpreter from "../prickly-pear/l-system-interpreter.js"
import { inchToPx, seededRandomNormal } from "../helpers/math.js"
import BumpyShape from '../prickly-pear/BumpyShape.js';

export default class PricklyPear {
  constructor(paper, settings) {
    this.paper = paper

    this.settings = {...{
      printDPI: 400,
      printWidth: 11.25,
      printHeight: 14.25,
      bleedSize: 0.125,
      safeArea: 0.375,
      seed: null
    }, ...settings }

    this.settings.source = !!this.settings.seed ? randomLcg(this.settings.seed) : null

    this.group = new paper.Group()
  }

  get zoomFactor() {
    return 1
  }

  pageSetup() {
    const { paper } = this.paper
    const { zoomFactor } = this
    const { printWidth, printHeight, printDPI } = this.settings

    let posterSize = new paper.Size(printWidth * printDPI, printHeight * printDPI)

    paper.view.setViewSize(posterSize)
    paper.view.setCenter(posterSize.divide(2 * zoomFactor))
    paper.view.setScaling(zoomFactor)
  }

  drawBleedLines() {
    const { paper } = this.paper
    const { bleedSize, printDPI } = this.settings

    let topLeft = new paper.Point(inchToPx(bleedSize, printDPI), inchToPx(bleedSize, printDPI))
    let bottomRight = new paper.Point(paper.view.bounds.bottomRight.x - inchToPx(bleedSize, printDPI), paper.view.bounds.bottomRight.y - inchToPx(bleedSize, printDPI))
    let bleedRectangle = paper.Shape.Rectangle(topLeft, bottomRight)
    bleedRectangle.strokeColor = 'red'
    bleedRectangle.strokeWidth = inchToPx(0.015625, printDPI)
  }

  drawSafeArea() {
    const { paper } = this.paper
    const { safeArea, printDPI } = this.settings

    let topLeft = new paper.Point(inchToPx(safeArea, printDPI), inchToPx(safeArea, printDPI))
    let bottomRight = new paper.Point(paper.view.bounds.bottomRight.x - inchToPx(safeArea, printDPI), paper.view.bounds.bottomRight.y - inchToPx(safeArea, printDPI))
    let bleedRectangle = paper.Shape.Rectangle(topLeft, bottomRight)
    bleedRectangle.strokeColor = 'blue'
    bleedRectangle.strokeWidth = inchToPx(0.015625, printDPI)
  }

  drawCactus() {
    const { paper } = this.paper
    const { group } = this
    const { source, printHeight, printDPI } = this.settings
    
    let pricklyPearLSystem = new LSystem('P[-X][X][+X]', [
      ['X', [
        'P[-X][+X]',
        'P[-X][+X]',
        'P[-X][+X][X]',
        'P[-X][+X][X]',
        'P[-X][+X][X][-X]',
      ]],
      ['P', [
        'P',
        'P',
        'P',
        'P',
        'P',
        'P',
        'P',
        'PP',
        'X',
      ]]
    ], source)

    let interpreter = new PricklyPearLSystemInterpreter(paper, {
      startingSegmentLength: inchToPx(printHeight * 0.382, printDPI),
      printDPI,
      source
    })

    let finalCladodes = pricklyPearLSystem.render(interpreter, 3).sort((a, b) => b.id - a.id)

    group.addChildren(finalCladodes.map(c => c.draw()))
  }

  drawBackground() {
    const { paper } = this.paper
    const { group } = this
    const { source, printDPI } = this.settings

    let bounds = paper.view.bounds

    let top, left, right, bottom, middleHeight, margin, middleOverlap

    margin = inchToPx(0.625, printDPI)
    top = bounds.top + margin
    bottom = bounds.bottom - margin
    left = bounds.left + margin
    right = bounds.right - margin
    middleHeight = bounds.height * seededRandomNormal({ expectedValue: 0.618, standardDeviation: 0.05 })()
    middleOverlap = bounds.height * 0.025


    let topBackground = new paper.Path.Rectangle({
      from: [left, top],
      to: [right, middleHeight + middleOverlap],
      fillColor: new paper.Color({
        hue: 317,
        saturation: 0.5,
        brightness: 0.61
      })
    })
    
    let bottomBackground = new paper.Path.Rectangle({
      from: [left - 20, middleHeight],
      to: [right + 20, bottom],
      fillColor: new paper.Color({
        hue: 317,
        saturation: 0.9,
        brightness: 0.15
      })
    })
    
    topBackground = new BumpyShape(topBackground, {
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

    bottomBackground = new BumpyShape(bottomBackground, {
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


    topBackground.remove()
    bottomBackground.remove()

    group.addChild(topBackground)
    group.addChild(bottomBackground)

    bottomBackground.sendToBack()
    topBackground.sendToBack()
  }


  render() {
    const paper = this.paper

    this.pageSetup()
    
    this.drawCactus()
    this.drawBackground()

    // this.drawBleedLines()
    // this.drawSafeArea()

    console.log(paper)

    paper.view.draw()
  }
}
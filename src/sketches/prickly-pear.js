import { randomLcg } from 'd3-random';
import LSystem from "../helpers/l-system.js"
import PricklyPearLSystemInterpreter from "../prickly-pear/l-system-interpreter.js"
import { inchToPx } from "../helpers/math.js"

export default class PricklyPear {
  constructor(paper, settings) {
    this.paper = paper

    this.settings = {...{
      printDPI: 150,
      printWidth: 11.25,
      printHeight: 14.25,
      bleedSize: 0.125,
      safeArea: 0.375,
      seed: null
    }, ...settings }

    this.settings.source = !!this.settings.seed ? randomLcg(this.settings.seed) : null
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
      ]]
    ], source)

    let interpreter = new PricklyPearLSystemInterpreter(paper, {
      startingSegmentLength: inchToPx(printHeight * 0.382, printDPI),
      source
    })

    pricklyPearLSystem.render(interpreter, 3)
  }


  render() {
    const paper = this.paper

    this.pageSetup()
    
    this.drawCactus()

    // this.drawBleedLines()
    // this.drawSafeArea()

    paper.view.draw()
  }
}
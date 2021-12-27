import LSystem from "../helpers/l-system.js"
import PricklyPearLSystemInterpreter from "../prickly-pear/l-system-interpreter.js"
import { inchToPx } from "../helpers/math.js"

export default class PricklyPear {
  constructor(paper, settings) {
    this.paper = paper

    this.settings = {...{
      printDPI: 300,
      printWidth: 11.25,
      printHeight: 14.25,
      bleedSize: 0.125,
      source: null
    }, ...settings }
  }

  get zoomFactor() {
    const { printDPI } = this.settings
    return printDPI / 300
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
    bleedRectangle.strokeWidth = 2
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
        'P',
        'P',
        'P',
        'PP',
      ]]
    ], source)

    let interpreter = new PricklyPearLSystemInterpreter(paper, {
      startingSegmentLength: inchToPx(printHeight * 0.382, printDPI),
      source
    })

    pricklyPearLSystem.render(interpreter, 2)
  }


  render() {
    const paper = this.paper
    const { printHeight, source } = this.settings

    this.pageSetup()
    
    this.drawCactus()

    this.drawBleedLines()

    paper.view.draw()
  }
}
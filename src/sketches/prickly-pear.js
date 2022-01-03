import { alea } from 'seedrandom';
import LSystem from "../helpers/l-system.js"
import PricklyPearLSystemInterpreter from "../prickly-pear/l-system-interpreter.js"
import { inchToPx, seededRandomInteger, seededRandomNormal } from "../helpers/math.js"
import Cladode from '../prickly-pear/Cladode.js';
import BackgroundRectangle from '../prickly-pear/BackgroundRectangle.js';

export default class PricklyPear {
  constructor(paper, settings) {
    this.paper = paper

    this.settings = {...{
      printDPI: 300,
      printWidth: 11.25,
      printHeight: 14.25,
      bleedSize: 0.125,
      safeArea: 0.375,
      seed: null
    }, ...settings }

    this.settings.source = !!this.settings.seed ? new alea(this.settings.seed) : null

    this.group = new paper.Group()

    this.palettes = this.defaultPalettes()
    this.randomizedPalette = this.randomPalette()
  }

  get zoomFactor() {
    return 1
  }

  defaultPalettes() {
    const { paper } = this.paper
    let hsbColor = this.hsbColor.bind(this)
    
    return [
      {
        cactus: hsbColor(99, 32, 67),
        dark: hsbColor(0, 0, 15),
        background: hsbColor(18, 50, 87),
      },
      {
        cactus: hsbColor(244, 42, 89),
        dark: hsbColor(0, 0, 15),
        background: hsbColor(240, 20, 86),
      },
      {
        cactus: hsbColor(205, 49, 93),
        dark: hsbColor(0, 0, 15),
        background: hsbColor(57, 50, 86),
      },
    ]
  }

  hsbColor(hue, saturation, brightness) {
    const { paper } = this.paper

    return new paper.Color({
      hue,
      saturation: saturation * 0.01,
      brightness: brightness * 0.01,
    })
  }

  randomPalette() {
    const { source } = this.settings

    return this.palettes[seededRandomInteger({
      min: 0,
      max: this.palettes.length,
      source
    })()]
  }
  get randomizedPalette() {
    return this._randomizedPalette
  }
  set randomizedPalette(palette) {
    this._randomizedPalette = palette
  }

  get palettes() {
    return this._palettes
  }
  set palettes(palettes) {
    this._palettes = palettes
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
    
    // let pricklyPearLSystem = new LSystem('P', [
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
    }, {
      klass: Cladode,
      settings: {
        palette: this.randomizedPalette
      }
    })

    let finalCladodes = pricklyPearLSystem.render(interpreter, 3).sort((a, b) => b.id - a.id)

    group.addChildren(finalCladodes.map(c => c.draw()))
  }

  drawBackground() {
    const { paper } = this.paper
    const { group } = this
    const { source, printDPI } = this.settings

    let palette = this.randomizedPalette

    let bounds = paper.view.bounds

    let top, left, right, bottom, middleHeight, margin, middleOverlap

    margin = inchToPx(0.625, printDPI)
    top = bounds.top + margin
    bottom = bounds.bottom - margin
    left = bounds.left + margin
    right = bounds.right - margin
    middleHeight = bounds.height * seededRandomNormal({ expectedValue: 0.618, standardDeviation: 0.05, source })()
    middleOverlap = bounds.height * -0.00125

    let topBackground = new BackgroundRectangle(paper, {
      from: [left, top],
      to: [right, middleHeight + middleOverlap],
      fillColor: palette.background,
      source
    })

    let bottomBackground = new BackgroundRectangle(paper, {
      from: [left, middleHeight],
      to: [right, bottom],
      fillColor: palette.dark,
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
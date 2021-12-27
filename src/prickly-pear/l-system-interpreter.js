import { clamp, TAU, degreesToRadians, seededRandomNormal } from "../helpers/math.js"
import Cladode from "./Cladode.js"

export default class PricklyPearLSystemInterpreter {
  constructor(paper, settings) {
    this.paper = paper

    this.settings = {...{
      startingSegmentLength: 100,
      source: null
    }, ...settings }

    this.cladodeLength = this.settings.startingSegmentLength

    this.cladodes = []
    this.savedCladodes = []

    this.growthOrientations = []
    this.savedGrowthOrientations = []

    return this.interpreter
  }

  addCladode(cladode) {
    this.cladodes.push(cladode)
  }

  get lastCladode() {
    return this.cladodes.slice(-1)[0]
  }

  saveCladode(cladode) {
    this.savedCladodes.push(cladode)
  }

  restoreLastSavedCladode() {
    this.cladodes.push(this.savedCladodes.pop())
  }

  addGrowthOrientation(growthOrientation) {
    this.growthOrientations.push(growthOrientation)
  }

  get lastGrowthOrientation() {
    return this.growthOrientations.slice(-1)[0]
  }

  saveGrowthOrientation(growthOrientation) {
    this.savedGrowthOrientations.push(growthOrientation)
  }

  restoreLastSavedGrowthOrientation() {
    this.growthOrientations.push(this.savedGrowthOrientations.pop())
  }

  get interpreter() {
    const { paper } = this.paper
    const { source } = this.settings
    let { cladodeLength } = this

    const rootCladode = () => {
      const paper = this.paper

      let angle = seededRandomNormal({
        expectedValue: 0,
        standardDeviation: 0.2,
        source
      })()
      
      let cladode = new Cladode(paper, {
        basePoint: new paper.Point(paper.view.bounds.bottomCenter.x, paper.view.bounds.bottomCenter.y + cladodeLength * 0.1),
        angle,
        length: cladodeLength,
        width: (0.6311 * cladodeLength) - 5.25,
        source
      })

      cladode.draw()

      this.addCladode(cladode)
      this.addGrowthOrientation([0.45, 0.55])
    }

    const newCladode = () => {
      const paper = this.paper
      const parent = this.lastCladode
      const growthOrientation = this.lastGrowthOrientation

      let sizeFactor = clamp(seededRandomNormal({
        expectedValue: -0.025 * Math.pow(this.savedCladodes.length, 2) + 0.7, 
        standardDeviation: 0.2,
        source
      })(), 0.3, 0.8)

      let growthLocation = parent.randomGrowthLocation(growthOrientation)

      let angle = seededRandomNormal({
        expectedValue: degreesToRadians(growthLocation.angle) + TAU * -0.25,
        standardDeviation: TAU * 0.025,
        source
      })()

      let cladodeLength = clamp(parent.length * sizeFactor, 30, 1000)

      let cladode = new Cladode(paper, {
        basePoint: growthLocation.point,
        angle,
        length: cladodeLength,
        width: (0.6311 * cladodeLength) - 5.25,
        source
      })

      cladode.draw()

      this.addCladode(cladode)
      this.addGrowthOrientation([0.47, 0.53])

    }

    const rotateLeft = () => {
      this.addGrowthOrientation([0.55, 0.65])
    }

    const rotateRight = () => {
      this.addGrowthOrientation([0.35, 0.45])
    }

    const saveState = () => {
      this.saveCladode(this.lastCladode)
      this.saveGrowthOrientation(this.lastGrowthOrientation)
    }

    const restoreState = () => {
      this.restoreLastSavedCladode()
      this.restoreLastSavedGrowthOrientation()
    }

    return function(current, previous) {
      let parent = this.lastCladode

      if (!parent) {
        rootCladode()

      } else if (current === "P" && !!parent) {
        newCladode()
        
      } else if (current === "-") {
        rotateLeft()
        
      } else if (current === "+") {
        rotateRight()
        
        
      } else if (current === "[") {
        saveState()

      } else if (current === "]") {
        restoreState()

      }

    }.bind(this)
  }
}

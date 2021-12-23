import { clamp, TAU } from "../helpers/math.js"
import Pear from "./Pear.js"

export default class PricklyPearLSystemInterpreter {
  constructor(p5, startingSegmentLength) {
    this.p5 = p5
    
    this.branches = []
    this.segments = []
    this.pearLength = startingSegmentLength

    return this.interpreter
  }

  get interpreter() {
    let { branches, segments, pearLength, p5 } = this

    const newPear = () => {
      p5.stroke('black')
      p5.translate(0, 7)
      p5.rotate(TAU * p5.randomGaussian(0, 0.03))

      let pad = new Pear(p5, 0, 0, 0.25, -pearLength, (0.6311 * pearLength) - 5.25)
      pad.draw()
      p5.translate(0, -(pearLength))

      segments.push(pad)
    }

    const rotateLeft = (parentPear) => {
      const { x, y, angle: branchAngle } = parentPear.branchNormal(3)
      p5.translate(-x, -y - parentPear.end.y)
      p5.rotate(branchAngle + (TAU * -0.25))
    }

    const rotateRight = (parentPear) => {
      const { x, y, angle: branchAngle } = parentPear.branchNormal(2)
      p5.translate(-x, -y - parentPear.end.y)
      p5.rotate(branchAngle + (TAU * -0.25))
    }

    const saveState = () => {
      p5.push()
      branches.push(segments.slice(-1)[0])
    }

    const restoreState = () => {
      p5.pop()
      segments.push(branches.pop())
    }

    return function(current, previous) {
      let parentPear = segments.slice(-1)[0]

      let sizeFactor = clamp(p5.randomGaussian(-0.025 * Math.pow(branches.length, 2) + 0.7, 0.2), 0.3, 0.8)

      if (!!parentPear) {
        pearLength = clamp(-parentPear.length * sizeFactor, 30, 1000)
      }

      if ((current === "P" || !parentPear) && pearLength > 30) {
        newPear()

      } else if (current === "-" && !['+', '-'].includes(previous)) {
        rotateLeft(parentPear)
        
      } else if (current === "+" && !['+', '-'].includes(previous)) {
        rotateRight(parentPear)

      } else if (current === "[") {
        saveState()

      } else if (current === "]") {
        restoreState()

      }
    }
  }
}

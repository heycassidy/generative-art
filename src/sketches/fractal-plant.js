import { mod, clamp, TAU } from "../helpers/math.js"
import LSystem from "../helpers/l-system.js"

const sketch = (p5) => {
  let settings = {
    width: 1400,
    height: 1100,
    step: 140,
    angle: TAU * 0.08,
    x: 700,
    y: 1100,
  }

  const plant = (k) => {
    let { step, angle } = settings
    
    if (k === "F") {
      settings.step = step * clamp(p5.randomGaussian(1, 0.05), 0.2, 1)

      p5.push()
      p5.strokeWeight(3)
      p5.point(0, 0)
      p5.pop()
      p5.line(0, 0, 0, -settings.step)
      p5.translate(0, -settings.step)
      p5.rotate(p5.randomGaussian(0, TAU * 0.1))

    } else if (k === "+") {
      p5.rotate(angle)

    } else if (k === "-") {
      p5.rotate(-angle)

    } else if (k === "[") {
      p5.push()

    } else if (k === "]") {
      p5.pop()
    }
  }

  p5.setup = () => {
    const { width, height } = settings

    let canvas = p5.createCanvas(width, height)
    p5.pixelDensity(2)
    p5.colorMode(p5.HSB)

    p5.noLoop()
  }

  p5.draw = () => {
    let { x, y } = settings

    p5.clear()

    p5.background(25, 4, 97)
    p5.strokeWeight(1)
    p5.stroke(229.4, 100, 64)

    let plantLSystem = new LSystem('X', [
      ['X', [
        'F[+X]F',
        'F[-X]F',
      ]],
      ['F', [
        'F',
      ]],
    ])

    p5.push()
    p5.translate(x, y)
    plantLSystem.render(plant, 5)
    p5.pop()
  }
}

export default sketch

import LSystem from "../helpers/l-system.js"
import PricklyPearLSystemInterpreter from "../prickly-pear/l-system-interpreter.js"

const sketch = (p5) => {
  let settings = {
    width: 1100,
    height: 1400,
    x: 550,
    y: 1480,
    randomSeed: null,
  }

  p5.setup = () => {
    const { width, height, randomSeed } = settings

    p5.createCanvas(width, height)
    p5.pixelDensity(2)
    p5.colorMode(p5.HSB)
    p5.noLoop()
    p5.randomSeed(randomSeed)
  }

  p5.draw = () => {
    let { x, y, randomSeed } = settings
    p5.drawingContext.globalCompositeOperation = 'destination-over'
    p5.clear()

    let pricklyPearLSystem = new LSystem('P[-X][X][+X]', [
      ['X', [
        'P[-PX][+X]',
        'P[-X][+PX]',
        'P[-X][+X][X]',
        'P[-X][+X][PX]',
        'P[-X][+X][PX][-X]',
      ]],
      ['P', [
        'P',
      ]]
    ], randomSeed)

    let interpreter = new PricklyPearLSystemInterpreter(p5, settings.height * 0.382)

    p5.push()
    p5.translate(x, y)
    pricklyPearLSystem.render(interpreter, 2)
    p5.pop()

    p5.background(10, 10, 99)
  }
}

export default sketch



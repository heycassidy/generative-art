import { mod, clamp, TAU } from "../helpers/math.js"
import LSystem from "../helpers/l-system.js"


const sketch = (p5) => {
  let settings = {
    width: 1100,
    height: 1400,
    step: 20,
    angle: TAU * 0.25,
    currentAngle: 0,
    currentIndex: 0,
  }


  settings['x'] = settings.width / 2
  settings['y'] = settings.height / 2

  const dragonCurve = (k) => {
    const { step, angle } = settings
    let { x, y, currentAngle } = settings

    if (k === 'A' || k === 'B') { // draw forward
      // polar to cartesian based on step and currentangle:
      let x1 = x + step * Math.cos(currentAngle);
      let y1 = y + step * Math.sin(currentAngle);

      p5.line(x, y, x1, y1); // connect the old and the new

      // update the turtle's position:
      settings.x = x1;
      settings.y = y1;

    } else if (k === '+') {
      settings.currentAngle += angle; // turn left

    } else if (k === '-') {
      settings.currentAngle -= angle; // turn right
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
    p5.clear()

    p5.background(25, 4, 97)
    p5.strokeWeight(4)
    p5.stroke(229.4, 100, 64);

    let dragonCurveLSystem = new LSystem('A', [
      ['A', 'A+B'],
      ['B', 'A-B']
    ])

    dragonCurveLSystem.render(dragonCurve, 7)
  }
}

export default sketch



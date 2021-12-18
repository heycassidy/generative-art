import { mod, clamp, TAU } from "../helpers/math.js"
import LSystem from "../helpers/l-system.js"

const sketch = (p5) => {
  let settings = {
    width: 1100,
    height: 1400,
    step: 400,
    angle: -TAU * 0.05,
    x: 550,
    y: 1420,
  }

  let colors = {
    surface: [80, 100, 50],
    edge: [90, 100, 40],
  }

  let segmentStack = []
  let branchStack = []

  const cactusRules = (current, previous) => {
    let { step, angle } = settings

    let parentPad = segmentStack.slice(-1)[0]

    if (!!parentPad) {
      settings.step = parentPad.length * clamp(p5.randomGaussian(-0.8, 0.2), -0.8, -0.5)
      // settings.step = parentPad.length * -0.7
    }

    if (current === "P" || !parentPad) {
      
      p5.stroke('black')
      p5.translate(0, 7)
      p5.rotate(TAU * p5.randomGaussian(0, 0.03))
      let pad = new PricklyPearPad(0, 0, 0.25, -settings.step, settings.step * 0.618)
      pad.draw()
      // p5.rotate(TAU * -0.01)
      p5.translate(0, -(settings.step))
      
      segmentStack.push(pad)
      // console.log(segmentStack)
      

    } else if (current === "-" && !['+', '-'].includes(previous)) {
      const { x, y, angle: branchAngle } = parentPad.branchNormal
      p5.translate(-x, -y - parentPad.end.y)
      p5.rotate(branchAngle + (TAU * -0.25))
    } else if (current === "+" && !['+', '-'].includes(previous)) {
      const { x, y, angle: branchAngle } = parentPad.branchNormal
      p5.translate(x, -y - parentPad.end.y)
      p5.scale(-1, 1)
      p5.rotate(branchAngle + (TAU * -0.25))

    } else if (current === "[") {
      p5.push()
      branchStack.push(segmentStack.slice(-1)[0])
      // confirm.log(branchStack)

    } else if (current === "]") {
      p5.pop()
      segmentStack.push(branchStack.pop())

    }
  }

  p5.setup = () => {
    const { width, height } = settings

    

    p5.createCanvas(width, height)
    p5.pixelDensity(2)
    p5.colorMode(p5.HSB)
    p5.noLoop()

    console.log(p5.drawingContext)
  }

  p5.draw = () => {
    let { x, y } = settings
    p5.drawingContext.globalCompositeOperation = 'destination-over'
    p5.clear()
    p5.strokeWeight(2)

    let pricklyPearLSystem = new LSystem('X', [
      ['X', [
        'P[-X][+X]',
        'P[+X][-X]',
        'P[-X]P[+X][X]',
        'P[-X][+X][X][+X]',
        'P[-X]P[+X][X][-X]',
        // 'X',
      ]],
      ['P', [
        'P',
      ]]
    ])

    p5.push()
    p5.drawingContext.globalCompositeOperation = 'destination-over'
    p5.translate(x, y)
    pricklyPearLSystem.render(cactusRules, 4)
    p5.pop()

    p5.background(25, 4, 97)

    
  }

  class Branch {
    constructor(baseX, baseY, angle, length) {
      this._baseX = baseX
      this._baseY = baseY
      this._angle = angle
      this._length = length
    }

    get start() {
      return {
        x: this._baseX,
        y: this._baseY
      }
    }

    get end() {
      return {
        x: (this._length * Math.cos(this._angle * TAU)) + this._baseX,
        y: (this._length * Math.sin(this._angle * TAU)) + this._baseY 
      }
    }

    get angle() {
      return this._angle
    }

    get length() {
      return this._length
    }

    draw() {
      p5.push();
      p5.stroke('red');
      p5.strokeWeight(2);
      p5.line(this.start.x, this.start.y, this.end.x, this.end.y);
      p5.pop();
    }
  }

  class PricklyPearPad extends Branch {
    constructor(baseX, baseY, angle, length, width) {
      super(baseX, baseY, angle, length)
      this._width = width
    }

    get width() {
      return this._width
    }


    get start() {
      return {
        x: this._baseX,
        y: this._baseY
      }
    }

    get points() {
      let width = this.width
      let length = this.length

      let baseWidth = 0.1
      let topRoundness = 0.4
      let sideHeight = 0.618
      let sideRoundness = 0.25
      let baseTaper = 0.15

      return [
        [0, 0, 0, 0, 0, 0],

        [
          -(width * baseTaper), -(length * 0.1),
          -(width * baseWidth), 0,
          -(width * baseWidth), 0
        ],

        [
          -(width * 0.5), -(length * sideHeight + length * sideRoundness),
          -(width * 0.5), -(length * sideHeight - length * sideRoundness),
          -(width * 0.5), -(length * sideHeight),
        ],

        [
          width * topRoundness,
          -length, -(width * topRoundness),
          -length, 0, -length
        ],

        [
          (width * 0.5), -(length * sideHeight - length * sideRoundness),
          (width * 0.5), -(length * sideHeight + length * sideRoundness),
          (width * 0.5), -(length * sideHeight),
        ],

        [
          (width * baseWidth), 0,
          (width * baseTaper), -(length * 0.1),
          (width * baseWidth), 0
        ],
      ]
    }

    calculateNormal(i, t = 0.5) {
      let points = this.points

      let currentAnchor = points[i].slice(-2)
      let currentControl = points[i].slice(0, 2)
      let nextAnchor = points[i + 1].slice(-2)
      let nextControl = points[i + 1].slice(-4, -2)

      let length = 30
      let x = p5.bezierPoint(currentAnchor[0], currentControl[0], nextControl[0], nextAnchor[0], t)
      let y = p5.bezierPoint(currentAnchor[1], currentControl[1], nextControl[1], nextAnchor[1], t)
      let tx = p5.bezierTangent(currentAnchor[0], currentControl[0], nextControl[0], nextAnchor[0], t)
      let ty = p5.bezierTangent(currentAnchor[1], currentControl[1], nextControl[1], nextAnchor[1], t)
      let a = Math.atan2(ty, tx) + (TAU * 0.25)

      return { x, y, tx: Math.cos(a) * length + x, ty: Math.sin(a) * length + y, angle: a }
    }

    get branchNormal() {
      return this.calculateNormal(3, p5.randomGaussian(0.4, 0.2))
      // return this.calculateNormal(2, 0.5)
    }

    drawBranchNormalLine() {
      const { x, y, tx, ty } = this.branchNormal

      p5.push()
      p5.line(x, y, tx, ty)
      p5.pop()
    }

    draw() {
      let { x, y } = this.start
      let angle = this.angle
      let points = this.points

      p5.push()
      p5.fill(...colors.surface)
      p5.strokeWeight(4)
      p5.stroke(...colors.edge)
      p5.translate(x, y)
      p5.rotate((0.25 * TAU) + (angle * TAU))

      p5.beginShape()
      p5.vertex(...points[0])

      for (let i = 0; i < points.length - 1; i++) {
        let currentControl = points[i].slice(0, 2)
        let nextAnchor = points[i + 1].slice(-2)
        let nextControl = points[i + 1].slice(-4, -2)
        p5.bezierVertex(...currentControl, ...nextControl, ...nextAnchor)
      }
      // this.drawBranchNormalLine()

      p5.endShape(p5.CLOSE)
      p5.pop()
    }
  }
}

export default sketch



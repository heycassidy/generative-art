import { mod, clamp, TAU } from "../helpers/math.js"

const sketch = (p5) => {
  let settings = {
    width: 1100,
    height: 1400,
  }

  let canvas;

  p5.setup = () => {
    const { width, height } = settings

    canvas = p5.createCanvas(width, height)
    p5.pixelDensity(2)
    p5.colorMode(p5.HSB)

    p5.noiseDetail(4, 0.9)

    p5.frameRate(1)
    p5.noLoop()

  }

  p5.draw = () => {
    p5.clear()

    p5.background(25, 4, 97)
    
    p5.strokeWeight(4)

    branches()
  }

  const branches = () => {
    const { width, height } = settings

    let branches = [
      new Branch(width * 0.5, height - 10, -0.25, 300)
    ]

    

    for (let i = 0; i < 4; i++){
      branches.push(new Branch(branches[i].end.x, branches[i].end.y, branches[i].angle + (p5.randomGaussian(0, 0.05)), branches[i].length - p5.randomGaussian(50, 10)))
    }

    branches.forEach(branch => {
      // branch.draw()
      branch.drawPricklyPearPad()
    })
    // console.log(branches)
    
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
      p5.strokeWeight(4);
      p5.line(this.start.x, this.start.y, this.end.x, this.end.y);
      p5.pop();
    }

    drawPricklyPearPad() {
      new PricklyPearPad(this.start.x, this.start.y, this.length * 0.618, this.length, this.angle).draw()
    }
  }

  class PricklyPearPad {
    constructor(baseX, baseY, width, height, angle) {
      this._baseX = baseX
      this._baseY = baseY
      this._width = width
      this._height = height
      this._angle = angle
    }

    get width() {
      return this._width
    }

    get height() {
      return this._height
    }

    get angle() {
      return this._angle
    }

    get start() {
      return {
        x: this._baseX,
        y: this._baseY
      }
    }

    get points() {
      let width = this.width
      let height = this.height

      let baseWidth = 0.1
      let topRoundness = 0.4
      let sideHeight = 0.618
      let sideRoundness = 0.25
      let baseTaper = 0.15

      return [
        [0, 0, 0, 0, 0, 0],

        [
          -(width * baseTaper), -(height * 0.1),
          -(width * baseWidth), 0,
          -(width * baseWidth), 0
        ],

        [
          -(width * 0.5), -(height * sideHeight + height * sideRoundness),
          -(width * 0.5), -(height * sideHeight - height * sideRoundness),
          -(width * 0.5), -(height * sideHeight),
        ],

        [
          width * topRoundness,
          -height, -(width * topRoundness),
          -height, 0, -height
        ],

        [
          (width * 0.5), -(height * sideHeight - height * sideRoundness),
          (width * 0.5), -(height * sideHeight + height * sideRoundness),
          (width * 0.5), -(height * sideHeight),
        ],

        [
          (width * baseWidth), 0,
          (width * baseTaper), -(height * 0.1),
          (width * baseWidth), 0
        ],
      ]
    }

    draw() {
      let { x, y } = this.start
      let angle = this.angle
      let points = this.points

      p5.push()
      p5.strokeWeight(5)
      p5.noFill()
      p5.translate(x, y)
      p5.rotate((0.25 * TAU) + (angle * TAU))

      p5.beginShape()
      p5.vertex(...points[0])

      for (let i = 0; i < points.length - 1; i++) {
        p5.bezierVertex(...points[i].slice(0, 2), ...points[i + 1].slice(-4))
      }

      p5.endShape(p5.CLOSE)
      p5.pop()

    }
  }
}

export default sketch



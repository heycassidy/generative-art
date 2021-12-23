import { TAU } from "../helpers/math.js"

export default class Branch {
  constructor(p5, baseX, baseY, angle, length) {
    this.p5 = p5
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
    this.p5.push();
    this.p5.stroke('red');
    this.p5.strokeWeight(2);
    this.p5.line(this.start.x, this.start.y, this.end.x, this.end.y);
    this.p5.pop();
  }
}
export default class Branch {
  constructor(paper, settings) {
    this.paper = paper

    this.settings = {...{
      basePoint: new paper.Point(0, 0),
      angle: 0,
      length: 100,
      source: null
    }, ...settings }
  }

  get start() {
    return this.settings.basePoint
  }

  get end() {
    const paper = this.paper
    const { basePoint, angle, length } = this.settings

    return new paper.Point(length * Math.cos(angle) + basePoint.x, length * Math.sin(angle) + basePoint.y)
  }

  get angle() {
    return this.settings.angle
  }

  get length() {
    return this.settings.length
  }

  draw() {
    const paper = this.paper
    const { start, end } = this

    return new paper.Path.Line({
      from: start,
      to: end,
      strokeColor: 'red',
      strokeWidth: 4
    })
  }
}
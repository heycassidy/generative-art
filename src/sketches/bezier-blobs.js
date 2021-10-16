Math.TAU = Math.PI * 2
const clamp = (num, min, max) => Math.min(Math.max(num, min), max)
const mod = (a, n) => ((a % n) + n) % n

const sketch = (p5) => {
  let settings = {
    width: 1200,
    height: 1200,
    randomSeed: 0,
    noiseSeed: 1,
    noiseX: 0,
    noiseY: 0,
    noiseT: 0,
  }

  const blob = (userParams) => {
    settings.noiseX += p5.randomGaussian(0, 0.02)
    settings.noiseY += p5.randomGaussian(0, 0.02)

    const { width, height } = settings

    let defaultParams = {
      left: p5.map(
        p5.noise(settings.noiseX, settings.noiseY),
        0,
        1,
        100,
        width
      ),
      top: p5.map(
        p5.noise(settings.noiseY, settings.noiseX),
        0,
        1,
        100,
        height
      ),
      horizontalDimension: 300,
      verticalDimension: 300,
    }
    const params = {
      ...defaultParams,
      ...userParams,
    }

    const randomizedPoint = (x, y, fractionalAngle, noiseSeed) => {
      // p5.noiseSeed(noiseSeed)
      settings.noiseT += 0.01

      return [
        x +
          p5.map(
            p5.noise(settings.noiseX + x, settings.noiseX + x),
            0,
            1,
            0,
            25
          ),
        y +
          p5.map(
            p5.noise(settings.noiseY + y, settings.noiseY + y),
            0,
            1,
            0,
            25
          ),
        fractionalAngle *
          Math.TAU *
          p5.map(p5.noise(settings.noiseT), 0, 1, 0.8, 1.2),
        p5.map(
          p5.noise(settings.noiseT),
          0,
          1,
          (params.horizontalDimension + params.verticalDimension) / 8,
          (params.horizontalDimension + params.verticalDimension) / 2
        ),
      ]
    }

    let points = [
      randomizedPoint(params.left, params.top, 0.875, settings.noiseSeed + 1),
      randomizedPoint(
        params.left + params.horizontalDimension,
        params.top,
        0.125,
        settings.noiseSeed + 2
      ),
      randomizedPoint(
        params.left + params.horizontalDimension,
        params.top + params.verticalDimension,
        0.375,
        settings.noiseSeed + 3
      ),
      randomizedPoint(
        params.left,
        params.top + params.verticalDimension,
        0.625,
        settings.noiseSeed + 4
      ),
    ]

    const controlPoint = (index, rotateAmount) => {
      const [x, y, angle, magnitude] = [
        points[index][0],
        points[index][1],
        points[index][2],
        points[index][3],
      ]

      let vector = p5.createVector(
        Math.cos(angle + rotateAmount * Math.PI) * magnitude + x,
        Math.sin(angle + rotateAmount * Math.PI) * magnitude + y
      )

      return { x: vector.x, y: vector.y }
    }

    const bezierVertexArgs = (index) => {
      const i0 = mod(index, points.length)
      const i1 = mod(index + 1, points.length)

      const [x, y] = [points[i1][0], points[i1][1]]

      const control0 = controlPoint(i0, 0)
      const control1 = controlPoint(i1, 1)

      return [control0.x, control0.y, control1.x, control1.y, x, y]
    }

    const getPointModulo = (i) => points[mod(i, points.length)]

    // curve
    p5.strokeWeight(2)
    p5.beginShape()
    p5.vertex(getPointModulo(0)[0], getPointModulo(0)[1])

    for (let i = 0; i < 4; i++) {
      const [cx0, cy0, cx1, cy1, x, y] = bezierVertexArgs(i)
      p5.bezierVertex(cx0, cy0, cx1, cy1, x, y)
    }

    p5.endShape(p5.CLOSE)

    for (let i = 0; i < 4; i++) {
      const [cx0, cy0, cx1, cy1, x, y] = bezierVertexArgs(i)
      // curve point
      p5.strokeWeight(8)
      p5.point(getPointModulo(i + 1)[0], getPointModulo(i + 1)[1])

      // control points
      p5.strokeWeight(12)
      // p5.stroke(330, 100, 64);
      p5.point(cx0, cy0)
      // p5.stroke(180, 100, 64);
      p5.point(cx1, cy1)

      // lines
      p5.strokeWeight(2)
      // p5.stroke(330, 100, 64);
      p5.beginShape(p5.LINES)
      p5.vertex(cx0, cy0)
      p5.vertex(getPointModulo(i)[0], getPointModulo(i)[1])
      p5.endShape()
      // p5.stroke(180, 100, 64);
      p5.beginShape(p5.LINES)
      p5.vertex(cx1, cy1)
      p5.vertex(getPointModulo(i + 1)[0], getPointModulo(i + 1)[1])
      p5.endShape()
    }
  }

  p5.setup = () => {
    const { width, height, randomSeed } = settings

    p5.createCanvas(width, height)
    p5.pixelDensity(2)
    p5.colorMode(p5.HSB)

    p5.noiseDetail(1, 0.1)
    p5.frameRate(30)
    p5.noLoop()
  }

  p5.draw = () => {
    p5.clear()
    p5.background(25, 4, 97)
    p5.stroke(229.4, 100, 64)

    blob()
  }
}

export default sketch

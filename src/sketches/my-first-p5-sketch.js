const sketch = (p5) => {
  const settings = {
    width: 800,
    height: 800,
  }

  const messySquare = (userParams) => {
    let defaultParams = {
      position: [0, 0],
      size: [10, 10],
    }
    const params = {
      ...defaultParams,
      ...userParams,
    }

    const left = params.position[0]
    const top = params.position[1]
    const width = params.size[0]
    const height = params.size[1]
    const vertexVariance = p5.random(0, 20)

    p5.noFill()
    p5.beginShape()
    p5.vertex(
      left + p5.random(-vertexVariance, vertexVariance),
      top + p5.random(-vertexVariance, vertexVariance)
    )
    p5.vertex(
      left + p5.random(-vertexVariance, vertexVariance) + width,
      top + p5.random(-vertexVariance, vertexVariance)
    )
    p5.vertex(
      left + p5.random(-vertexVariance, vertexVariance) + width,
      top + height + p5.random(-vertexVariance, vertexVariance)
    )
    p5.vertex(
      left + p5.random(-vertexVariance, vertexVariance),
      top + height + p5.random(-vertexVariance, vertexVariance)
    )
    p5.endShape(p5.CLOSE)
  }

  p5.setup = () => {
    const { width, height } = settings
    
    p5.createCanvas(width, height)
    p5.colorMode(p5.HSB)
    p5.background(25, 4, 97)
    p5.frameRate(30)
    p5.noLoop()
  }
  
  p5.draw = () => {
    const { width, height } = settings

    const padding = p5.random(20, 200);
    const horizontalCellCount = p5.int(p5.random(3, 16));
    const verticalCellCount = p5.int(p5.random(3, 16));
    const cellWidth = (width - (2 * padding)) / horizontalCellCount
    const cellHeight = (height - (2 * padding)) / verticalCellCount

    for (let x = 0; x < horizontalCellCount; x += 1) {
      for (let y = 0; y < verticalCellCount; y += 1) {
        messySquare({
          position: [(cellWidth * x) + padding, (cellHeight * y) + padding],
          size: [cellWidth, cellHeight],
        })
      }
    }
    
  }
}

export default sketch

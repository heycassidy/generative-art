import { mod, clamp } from "../helpers/math.js"

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

    grid()

    // p5.save(canvas, "myCanvas.jpg")
  }

  const grid = () => {
    const { width, height } = settings
    const columnCount = p5.int(clamp(p5.randomGaussian(3, 20), 3, 7))
    const rowCount = p5.int(columnCount * 1.2727)
    const horizontalPadding = p5.int(clamp((825 / columnCount), 150, 400))
    const verticalPadding = p5.int(clamp((1050 / rowCount), 190, 510))
    const cellWidth = p5.int((width - (horizontalPadding * 2)) / (columnCount - 1))
    const cellHeight = p5.int((height - (verticalPadding * 2)) / (rowCount - 1))
    const noiseScale = 0.0005

    p5.noiseSeed(p5.random(0, 100))
    for (let column = horizontalPadding; column <= width - horizontalPadding; column += cellWidth) {
      for (let row = verticalPadding; row <= height - verticalPadding; row += cellHeight) {
        p5.stroke(229.4, 100, 64)

        p5.strokeWeight(
          p5.map(p5.noise(column * noiseScale, row * noiseScale),
          0, 1,
          2, (cellWidth - (cellWidth * 0.2)))
        )

        p5.point(column, row)
      }
    }

    p5.noiseSeed(p5.random(0, 100))
    for (let column = horizontalPadding; column <= width - horizontalPadding; column += cellWidth) {
      for (let row = verticalPadding; row <= height - verticalPadding; row += cellHeight) {
        // p5.strokeWeight(cellWidth - cellWidth * 0.7)
        p5.strokeWeight(
          p5.map(p5.noise(column * noiseScale, row * noiseScale),
          0, 1,
          2, (cellWidth - (cellWidth * 0.5)))
        )
        p5.stroke(
          p5.map(p5.noise(column * noiseScale, row * noiseScale), 0, 1, 200, 300),
          100,
          100
        )

        p5.point(column, row)
      }
    }
  }
}

export default sketch

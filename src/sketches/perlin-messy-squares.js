const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const sketch = (p5) => {
  let image;

  let settings = {
    width: 1100,
    height: 1400,
    noiseSeed: 99,
    randomSeed: 1,
    noiseX: 1,
    noiseY: 1,
    cellSize: 0

  };

  const messySquare = (userParams) => {
    let defaultParams = {
      position: [0, 0],
      size: [10, 10],
    };
    const params = {
      ...defaultParams,
      ...userParams,
    };

    const left = params.position[0];
    const top = params.position[1];
    const width = params.size[0];
    const height = params.size[1];
    const vertexDeviation = params.size[0] * 0.01;
    // const vertexDeviation = 0;

    p5.noFill();
    p5.beginShape();
    p5.vertex(
      left + p5.randomGaussian(0, vertexDeviation),
      top + p5.randomGaussian(0, vertexDeviation)
    );
    p5.vertex(
      left + p5.randomGaussian(0, vertexDeviation) + width,
      top + p5.randomGaussian(0, vertexDeviation)
    );
    p5.vertex(
      left + p5.randomGaussian(0, vertexDeviation) + width,
      top + height + p5.randomGaussian(0, vertexDeviation)
    );
    p5.vertex(
      left + p5.randomGaussian(0, vertexDeviation),
      top + height + p5.randomGaussian(0, vertexDeviation)
    );
    p5.endShape(p5.CLOSE);
  };

  const grid = () => {
    const { width, height, noiseX, noiseY } = settings;
    // const cellSize = p5.int(p5.randomGaussian(64, 16));
    // const cellSize = 16 * p5.sin(settings.cellSize / 32) + 64;
    const cellSize = 48

    const padding = clamp(cellSize * 1.5, 64, 128);
    
    const left = p5.int(padding);
    const right = p5.int(width - (padding + cellSize));
    const top = p5.int(padding);
    const bottom = p5.int(height - (padding + cellSize));
    const columnsCount = (right - left) / cellSize;
    const rowsCount = (bottom - top) / cellSize;
    const noiseScale = 0.05

    p5.noiseDetail(cellSize, 0.5);

    for (let column = 0; column < columnsCount; column++) {
      for (let row = 0; row < rowsCount; row++) {
        let size;
        let positionVariance = 0
        
        positionVariance = p5.noise(column * noiseScale, row * noiseScale)
        positionVariance = p5.map(positionVariance, 0, 1, cellSize / -4, cellSize / 4)

        size = p5.noise(column * noiseScale + noiseX, row * noiseScale * 100 + noiseY);
        size = p5.map(size, 0.2, 1, cellSize * 0.1, cellSize * 2);

        messySquare({
          position: [
            column * cellSize + padding + positionVariance,
            row * cellSize + padding + positionVariance,
          ],
          size: [size, size * 0.5],
        });
      }
    }
  };

  p5.setup = () => {
    const { width, height } = settings;

    image = p5.createCanvas(width, height);
    p5.pixelDensity(2);
    p5.colorMode(p5.HSB);

    p5.frameRate(30);
    // p5.noLoop();
    
    // settings.noiseSeed = settings.noiseSeed + 1
    // settings.randomSeed = settings.randomSeed + 1
    
    p5.randomSeed(settings.randomSeed)
    p5.noiseSeed(settings.noiseSeed)
  };
  
  p5.draw = () => {
    p5.clear();
    
    settings.noiseX += 0.01
    // settings.noiseY += 0.01
    settings.cellSize += 1

    p5.background(25, 4, 97);
    p5.stroke(229.4, 100, 64);
    p5.strokeWeight(2);
    grid();
  };
};

export default sketch;

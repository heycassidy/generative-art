import SimplexNoise from 'simplex-noise'

export default class Procedural2DSimplexNoise {
  constructor (settings) {
    this.settings = {
      ...{
        xOffset: 0,
        yOffset: 0,
        xScale: 1,
        yScale: 1,
        octaves: 8,
        frequency: 1,
        persistence: (Math.sqrt(5) - 1) / 2,
        lacunarity: (1 + Math.sqrt(5)) / 2,
        seedSource: '1'
      },
      ...settings
    }

    this.simplex = new SimplexNoise(this.settings.seedSource)
  }

  value(x, y) {
    const simplex = this.simplex
    let {
      xOffset,
      yOffset,
      xScale,
      yScale,
      octaves,
      persistence,
      frequency,
      lacunarity,
    } = this.settings

    let total = 0
    let amplitude = 1
    let max = 0

    for (let i = 0; i < octaves; i++) {
      total += simplex.noise2D(x * yScale * frequency + xOffset, y * xScale * frequency + yOffset) * amplitude
      max += amplitude
      frequency *= lacunarity
      amplitude *= persistence
    }

    return total / max
  }
}
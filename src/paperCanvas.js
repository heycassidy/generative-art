
import { paper } from 'paper';
import PricklyPear from './sketches/prickly-pear.js'
import { randomLcg } from 'd3-random';

// let seed = Math.random()
let seed = 0.3735237190243268

console.log(`seed used: ${seed}`)

export default function paperCanvas(node) {
  paper.setup(node);

  let pricklyPearDrawing = new PricklyPear(paper, {
    seed
  })

  pricklyPearDrawing.render()
}
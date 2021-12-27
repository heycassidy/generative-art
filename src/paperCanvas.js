
import { paper } from 'paper';
import PricklyPear from './sketches/prickly-pear.js'
import { randomLcg } from 'd3-random';

export default function paperCanvas(node) {
  paper.setup(node);

  let pricklyPearDrawing = new PricklyPear(paper, {
    // seed: 23980293
  })

  pricklyPearDrawing.render()
}

import { paper } from 'paper';
import PricklyPear from './sketches/prickly-pear.js'
import { alea } from 'seedrandom';

let prng = new alea(Math.random())

let seed = prng()
// let seed = 0.9124023119688898
// let seed = 0.6443698578192487

console.log(`seed used: ${seed}`)

export default function paperCanvas(node) {
  paper.setup(node);

  let pricklyPearDrawing = new PricklyPear(paper, { seed })

  pricklyPearDrawing.render()
}
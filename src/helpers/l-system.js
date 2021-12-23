import { randomIntegerFromInterval } from './math.js'

export default class LSystem {
  constructor(axiom, rules, seed) {
    this._axiom = axiom
    this._rules = rules
    this._seed = seed
  }

  replaceSentence(sentence) {
    const rules = this._rules

    return [...sentence]
      .map((word) => {
        return rules.reduce((acc, rule) => {
          return word === rule[0] ? rule[1][randomIntegerFromInterval(0, rule[1].length - 1, this._seed)] : acc
        }, word)
      }).join('')
  }

  computeAxiom(n) {
    let axiom = this._axiom

    for (let i = 0; i < n; i++) {
      axiom = this.replaceSentence(axiom);
    }

    return axiom
  }

  render(interpreter, n) {
    let axiom = this.computeAxiom(n)
    
    for (let i = 0; i < axiom.length; i++) {
      interpreter(axiom[i], axiom[i - 1])
    }
  }
}
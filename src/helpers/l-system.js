import { randomIntegerFromInterval } from './math.js'

export default class LSystem {
  constructor(axiom, rules) {
    this._axiom = axiom
    this._rules = rules
  }

  replaceSentence(sentence) {
    const rules = this._rules

    return [...sentence]
      .map((word) => rules
      .reduce((acc, rule) => word === rule[0] ? rule[1][randomIntegerFromInterval(0, rule[1].length - 1)] : acc, word))
      .join()
  }

  computeAxiom(n) {
    let axiom = this._axiom

    for (let i = 0; i < n; i++) {
      axiom = this.replaceSentence(axiom);
    }

    return axiom
  }

  render(func, n) {
    let axiom = this.computeAxiom(n)
    
    for (let i = 0; i < axiom.length - 1; i++) {
      func(axiom[i])
    }
  }
}
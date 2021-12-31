import { seededRandomInteger } from './math.js'

export default class LSystem {
  constructor(axiom, rules, source) {
    this._axiom = axiom
    this._rules = rules
    this._source = source
  }

  replaceSentence(sentence) {
    const rules = this._rules

    return [...sentence]
      .map((word, i) => {
        return rules.reduce((acc, rule) => {
          let randomRule = seededRandomInteger({
            min: 0,
            max: rule[1].length,
            source: this._source
          })()

          return word === rule[0] ? rule[1][randomRule] : acc
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
    let segments
    
    for (let i = 0; i < axiom.length; i++) {
      segments = interpreter(axiom[i], axiom[i - 1])
    }

    return segments
  }
}
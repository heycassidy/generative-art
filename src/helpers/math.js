import seedrandom from 'seedrandom';


export const TAU = Math.PI * 2

export const mod = (n, a) => ((n % a) + a) % a
export const clamp = (num, min, max) => Math.min(Math.max(num, min), max)
export const randomSign = Math.random() < 0.5 ? -1 : 1
export const randomIntegerFromInterval = (min, max, seed) => Math.floor(seedrandom(seed)() * (max - min + 1) + min)
import { isFunction } from "util";

const checker = (x: any): x is (() => Generator) => isFunction(x);

export function * braid (generator1: Generator | (() => Generator), generator2: Generator | (() => Generator)): Generator {
	let gen1 : Generator = checker(generator1) ? generator1() : generator1;
	let gen2 : Generator = checker(generator2) ? generator2() : generator2;
	let val1 = gen1.next();
	let val2 = gen2.next();
	while(!val1.done || !val2.done) {
		if (!val1.done) {
			yield val1.value;
			val1 = gen1.next();
		}
		if(!val2.done) {
			yield val2.value;
           val2 = gen2.next();
		}
	}
}

export function* biased(generator1: Generator | (() => Generator), generator2: Generator | (() => Generator)) : Generator {
	let gen1: Generator = checker(generator1) ? generator1() : generator1;
	let gen2: Generator = checker(generator2) ? generator2() : generator2;
	let val1 = gen1.next();
	let val2 = gen2.next();
	while(!val1.done || !val2.done) {
		if (!val1.done) {
			yield val1.value;
			val1 = gen1.next();
		}
		if (!val1.done) {
			yield val1.value;
			val1 = gen1.next();
		}
		if (!val2.done) {
			yield val2.value;
			val2 = gen2.next();
		}
	}
}

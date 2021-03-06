// Understanding JavaScript Generators with Examples
// https://codeburst.io/understanding-generators-in-es6-javascript-with-examples-6728834016d5

// interface Generator { value: Any; done: true | false } 

export function * take(n: number, iter: any) {
	let index: number = 0;
	for (const val of iter) {
		if (index >= n) {
			return;
		}
		index = index + 1;
		yield val;
	}
}

export function * braid <T1,T2,T3,T4,T5,T6>(generator1 : (() => Generator<T1,T2,T3>), 
									generator2 : (() => Generator<T4,T5,T6>)) : 
									Generator /*<T1|T2|T4|T5, void, T3|T6>*/ {
	let gen1 : Generator = generator1();
	let gen2 : Generator = generator2();
	let num: number = 1;
	let check: number = 0;
	while(check < 2) {
		if (num % 2 === 1) {
			num = num + 1;
			// yield gen1.next().value; 
			const g1 : any = gen1.next();
			if (g1.done) {
                check++;
				continue;
			}
			yield g1.value;
            // (g1 !== undefined) ? yield g1.value : num = num + 1;
		}
		else {
			num = num + 1;
			// yield gen2.next().value;
			const g2 : any = gen2.next();
			if (g2.done) {
                check = check + 1;
				continue;
			}
			yield g2.value;
            // (g2 !== undefined) ? yield g2.value : num = num + 1;
		}
	}
}

function* gen1() {
	yield 3;
	yield 6;
	yield 9;
	yield 12;
}
function* gen2() {
	yield 8;
	yield 10;
}

// for (let n of take(10, braid(gen1,gen2))) {
// 	console.log(n);
// }
// expected: 3, 8, 6, 10, 9, 12

// const numbers = braid(gen1, gen2)
// for (let index = 0; index < 8; index++) {
// 	console.log(numbers.next().value);	
// }
// 3, 8, 6, 10, 9, 12, undefined, undefined 

export function* biased(generator1: (() => Generator), generator2: (() => Generator)) : Generator {
	let gen1: Generator = generator1();
	let gen2: Generator = generator2();
	let num : number = 1;
	let check: number = 0;
	while(check < 3) {
		if (num % 3 !== 0) {
			num = num + 1;
			// yield gen1.next().value;
			const g1 : any = gen1.next();
			if (g1.done) {
				check++;
				continue;
			}
			yield g1.value;
            // (g1 !== undefined) ? yield g1 : num = num + 1;
		}
		else {
			num = num + 1;
			// yield gen2.next().value;
			const g2:any = gen2.next();
			if (g2.done) {
				check++;
				continue;
			}
			yield g2.value;
            // (g2 !== undefined) ? yield g2 : num = num + 1;
		}
	}
}
// for (let n of take(6, biased(gen1,gen2))) {
// 	console.log(n);
// }
// 3, 6, 8, 9, 12, 10

// const nums = braid(gen1, gen2)
// for (let index = 0; index < 8; index++) {
// 	console.log(nums.next().value);	
// }
// 3, 6, 8, 9, 12, 10, undefined, undefined 
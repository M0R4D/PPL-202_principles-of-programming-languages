import * as R from 'ramda'
/* Question 1 */
/* generic function called partition that takes two parameters: a predicate and an array, and returns
an array of arrays: the first array consists of all elements that satisfy the predicate, and the second array of
the rest. */
//----- const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
//----- console.log(partition(x => x % 2 === 0, numbers)); // => [[2, 4, 6, 8], [1, 3, 5, 7, 9]];

// export const partition : <T>(pred: (x:T) => boolean, arr: T[]) => T[][] = <T>(pred: (x:T) => boolean, arr: T[]) : T[][] => R.reduce((acc,curr) => {
//     pred(curr) ? R.concat(acc[0]) : R.concat(acc[1]);
// } , [[],[]], arr) //TODO
// export const partition : <T>(pred: (x:T) => boolean, arr: T[]) => T[][] = <T>(pred: (x:T) => boolean, arr: T[]) : T[][] => [R.filter(pred,arr)].concat([R.filter(pred,arr)]);
export const partition : <T>(pred: (x:T) => boolean, arr: T[]) => T[][] = <T>(pred: (param: T) => boolean, x: T[]) : T[][]  => [R.filter(pred,x), R.reject(pred,x)];

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
console.log(partition(x => x % 2 === 0, numbers)); // => [[2, 4, 6, 8], [1, 3, 5, 7, 9]];


/* Question 2 */
/* generic function called mapMat that works like map but on matrices. */
/* for example: 
//----- const mat = [
//-----     [1, 2, 3],
//-----     [4, 5, 6],
//-----     [7, 8, 9]
//-----     ]
//----- console.log(mapMat(x => x * x, mat)); // => [[ 1, 4, 9 ], [ 16, 25, 36 ], [ 49, 64, 81 ]] */
export const mapMat : <T1,T2>(func: (x: T1) => T2, matrix: T1[][]) => T2[][] = <T1,T2>(func: (x:T1) => T2, mat: T1[][]) : T2[][] => R.map((x) => R.map(func, x),mat);
console.log(mapMat(x => x * x, [ [0,1,2,3],[4,5,6],[7,8,9] ])); // expect => [[ 1, 4, 9 ], [ 16, 25, 36 ], [ 49, 64, 81 ]]


/* Question 3 */
/*  generic function called composeMany that takes an array of n ≥ 0 functions 
fi : T → T and returns a function that is their composition. */
/* for example: 
//----- const squareAndHalf = composeMany([(x: number) => x / 2, (x: number) => x * x]);
//----- console.log(squareAndHalf(5)); // => 12.5
//----- const add3 = composeMany([(x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1]);
//----- console.log(add3(5)); // => 8 */
export const composeMany: <T>(funcs: ((x:T) => T)[])=> (x:T) => T  = <T>(funcs : ((x:T) => T)[]) : (x:T) => T => R.reduce((acc,curr) => R.compose(acc,curr) , x => x , funcs);
const squareAndHalf = composeMany([(x: number) => x / 2, (x: number) => x * x]);
console.log(squareAndHalf(5)); // => 12.5


/* Question 4 */
interface Languages {
    english: string;
    japanese: string;
    chinese: string;
    french: string;
}

interface Stats {
    HP: number;
    Attack: number;
    Defense: number;
    "Sp. Attack": number;
    "Sp. Defense": number;
    Speed: number;
}

interface Pokemon {
    id: number;
    name: Languages;
    type: string[];
    base: Stats;
}

/* maxSpeed which returns an array of the Pokemon (as in a value of the Pokemon type) with the maximum "Speed" stat */
// export const maxSpeed : (pokes:Pokemon[]) => Pokemon[] = (pokes: Pokemon[]) : Pokemon[] => ;
// R.reduce((acc:Pokemon[],elem:Pokemon)=> (acc.length===0)?[elem]:(elem.base.Speed===acc[0].base.Speed)?
// acc.concat([elem]):elem.base.Speed>acc[0].base.Speed?[elem]:acc,[], pokes)
export const maxSpeed : (pokes:Pokemon[]) => Pokemon[] = (x: Pokemon[]) : Pokemon[] => {
    let maxspeed: number = x.reduce((acc, cur) => Math.max(acc, cur.base.Speed), Number.NEGATIVE_INFINITY)
    return R.filter(y => y.base.Speed === maxspeed, x);
}

/* grassTypes which returns an array of the English names of all Grass type Pokemon sorted alphabetically */
// export const grassTypes : (pokes:Pokemon[]) => string[] = (pokes: Pokemon[]) : string[] => [].sort();
export const grassTypes : (pokes:Pokemon[]) => string[] = (x: Pokemon[]) : string[] => R.filter(y => y.type.includes("Grass"), x).map((x: Pokemon) => x.name.english).sort();

/* uniqueTypes which returns an array of all the different Pokemon types (Grass, Fire, etc) sorted alphabetically */
// export const uniqueTypes : (pokes:Pokemon[]) => string[] = (pokes: Pokemon[]) : string[] => [].sort();
export const uniqueTypes : (x:Pokemon[]) => string[] = (x: Pokemon[]) : string[] => x.map(y => y.type).reduce((acc, cur) => acc.concat(cur.filter(z => !acc.includes(z))), []).sort();

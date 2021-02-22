// JavaScript Ninja — Understanding Promise
// https://codeburst.io/javascript-ninja-understanding-promise-f4dd22c2d5d8

// import { fPromise, gPromise, hPromise } from './part4';

// const f = fPromise;
// const g = gPromise;
// const h = hPromise;


// interface Promise {
//     task : string;
//     value : boolean;
//     err :  ;
//     state : "Pending" | "Fullfiled" | "Rejected";
//     handles : ;
// }

/*
// Use the promise interface to write an asynchronous code that performs
// the following computation. Handle possible errors by printing them to the
// screen.
*/

// function f (x : number) : number {
//     return 1/x;
// }
// function g (x : number) : number {
//     return x*x;
// }
// function h (x : number) : number {
//     return f(g(x));
// }

function asyncf(x:number, callback: (result:number) => void) : void {
    callback(1 / x);
}
function asyncg(x:number, callback: (result:number) => void) : void {
    callback(x * x);
}
function asynch(x:number, callback: (result:number) => void) : void {
    asyncg(x , (gRes: number) => 
        (asyncf(gRes, (fRes: number) => 
            (callback(fRes)))));
}

// function f (x:number, callback: (err:Error|undefined, fRes:number) => void) : void {
//     if (x === 0) {
//         callback(Error("Error: division by Zero"), x);
//     }
//     else {
//         callback(undefined, 1/x);
//     }
// }
export function fPromise (x:number) : Promise<number> {//, callback: (err:Error, fRes:number) => void) : void {
    return new Promise<number> ( (resolve, reject) => {
        if (x === 0) {
            reject(Error("Error: division by Zero"));
        }
        else {
            resolve(1/x);
        }
    })
}

// function g (x:number, callback: (err:Error|undefined, gRes:number) => void) : void {
//     callback(undefined, x*x);
// }
export function gPromise (x:number) : Promise<number> {//, callback: (err:Error, gRes:number) => void) : void {
    return new Promise<number> ( (resolve, reject) => {
        resolve(x*x);
    })
}

// function h (x:number, callback: (err:Error|undefined, fRes:number) => void) : void {
//     g(x, (gErr, gRes) => {
//         if (gErr) {
//             callback(gErr, x);
//         }
//         else{
//             f(gRes, callback);
//         }
//     })
// }
export function hPromise (x:number) : Promise<any> {//, callback: (err:Error|undefined, fRes:number) => void) : void {
    if (x === 0) {
        return fPromise(x)
    }
    return gPromise(x)
    .then(y => {
        fPromise(y);
    })
    .then(y => y);
    // .catch( (error) => console.error(error))
}

// console.log(fPromise(0)); // inf
// console.log(fPromise(1)); // 1
// console.log(gPromise(0)); // 0
// console.log(gPromise(2)); // 4
// console.log(hPromise(0)); // inf
// console.log(hPromise(3)); // 1/9

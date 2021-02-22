export const f: (num: number) => Promise<number> = (num: number) : Promise<number> =>
    new Promise((resolve,reject) => num === 0 ? reject(new Error("dividing by zero")) : resolve(1/num));
    
export const g: (num: number) => Promise<number> = (num: number) : Promise<number> =>
    new Promise((resolve) => resolve(num*num));

export const h: (num: number) => Promise<number> = (num: number) : Promise<number> =>
    g(num)
    .then((result1) => f(result1))
    .catch((result2) => {
        console.log(result2); 
        return result2
    });
    

export const slower = (promises : Promise<any>[]) : Promise<(any)[]> => 
    Promise.race(promises)
    .then((first) => Promise.all(promises)
    .then((result) => result[0] === first ? new Promise((resolve) => resolve([1, result[1]])) :
            new Promise((resolve) => resolve([0, result[0]]))));
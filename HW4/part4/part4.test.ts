import { expect } from 'chai';
import { f, g, h } from './part4';

describe('promises a', () => {
    it('test f - should return 1', async () => {
        expect(await f(1)).to.equal(1);
    });
    it('test f - 2 should return 0.5', async () => {
        expect(await f(2)).to.equal(0.5);
    });
    //todo: change acoording to answer 
    //https://www.cs.bgu.ac.il/~ppl202/Forum_Ex_4?action=show-thread&id=88454bac09c11b04031c40f7f9ea1bca
    it('test f - should fail', async () => {
        await f(0).catch((error : any) => expect(error).to.be.an("error"));
    });
    it('test g - should return 1', async () => {
        expect(await g(1)).to.equal(1);
    });
    it('test g - 2 should return 4', async () => {
        expect(await g(2)).to.equal(4);
    });
    it('test g - should return 0', async () => {
        expect(await g(0)).to.equal(0);
    });
    it('test h - should return 1', async () => {
        expect(await h(1)).to.equal(1);
    });
    it('test h - 2 should return 0.25', async () => {
        expect(await h(2)).to.equal(0.25);
    });
    it('test h - should fail', async () => {
        await h(0).catch((error : any) => expect(error).to.be.an("error"));
    });
});

// describe('promises 2', () => {
//     it('both fail', async () => {  
//         const first = Promise.reject(new Error("the end has come"));
//         const second = Promise.reject(new Error("failing")); 
//         await slower([ first, second ]).catch((error : any) => expect(error).to.be.an("error"));
//     });
//     it('the first', async () => {
//         const lateFuncProm = new Promise((resolve) => 
//             setTimeout(() => resolve('i\'m late'), 1));
//         const alreadyFulfilledProm = Promise.resolve(666);
//         expect(await slower([ lateFuncProm, alreadyFulfilledProm ]))
//             .to.deep.equal([0, 'i\'m late']);
//     });
//     it('the second', async () => {
//         const lateFuncProm = new Promise((resolve) => 
//             setTimeout(() => resolve('i\'m late'), 1));
//         const alreadyFulfilledProm = Promise.resolve(666); 
//         expect(await slower([ alreadyFulfilledProm, lateFuncProm ]))
//             .to.deep.equal([1, 'i\'m late']);
//     });
// });
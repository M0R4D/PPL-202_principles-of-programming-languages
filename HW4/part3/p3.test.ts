import { expect } from 'chai';
import { range } from 'ramda';
import { braid, biased } from './part3';

describe('generators q1', () => {
    // what to do when one ends - https://www.cs.bgu.ac.il/~ppl202/Forum_Ex_4?action=show-thread&id=63dc415429ea86d213449c0d6b0a574f
    it('example from assaginment', () => {
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
        const gen = braid(gen1, gen2);
        expect(gen.next()).to.equal(3);
        expect(gen.next()).to.equal(8);
        expect(gen.next()).to.equal(6);
        expect(gen.next()).to.equal(10);
        expect(gen.next()).to.equal(9);
        expect(gen.next()).to.equal(12);
        expect(gen.next()).to.equal(undefined);
        // expect(gen.next()).to.deep.equal({ value: 3, done: false });
        // expect(gen.next()).to.deep.equal({ value: 8, done: false });
        // expect(gen.next()).to.deep.equal({ value: 6, done: false });
        // expect(gen.next()).to.deep.equal({ value: 10, done: false });
        // expect(gen.next()).to.deep.equal({ value: 9, done: false });
        // expect(gen.next()).to.deep.equal({ value: 12, done: false });
        // expect(gen.next()).to.deep.equal({ done: true, value: undefined });
    });
    it('the 2nd is longer', () => {
        const g1 = range(0, 5);
        const g2 = range(5, 13);
        function* gen1(arr: number[]) {
            for (let i in arr) {
                yield arr[i];
            }
        }
        const gen = braid(gen1(g1), gen1(g2));
        for (let i in range(0, 5)) {
            expect(gen.next()).to.deep.equal({ value: g1[i], done: false });
            expect(gen.next()).to.deep.equal({ value: g2[i], done: false });
        }
        for (let i in range(5, 8)) {
            expect(gen.next()).to.deep.equal({ value: g2[5 + Number(i)], done: false });
        }
        expect(gen.next()).to.deep.equal({ done: true, value: undefined });
    });
    it('take 2! the first is empty', () => {
        const g1 = range(0, 5);
        function* gen1() { };
        function* gen2(arr: number[]) {
            for (let i in arr) {
                yield arr[i];
            }
        };
        const gen = braid(gen1, gen2(g1));
        for (let i in range(0, 5)) {
            expect(gen.next()).to.deep.equal({ value: g1[i], done: false });
        }
        expect(gen.next()).to.deep.equal({ done: true, value: undefined });
    });
    it('or the second instead', () => {
        const g1 = range(0, 5);
        function* gen1(arr: number[]) {
            for (let i in arr) {
                yield arr[i];
            }
        }
        function* gen2() { }
        const gen = braid(gen1(g1), gen2());
        for (let i in range(0, 5)) {
            expect(gen.next()).to.deep.equal({ value: g1[i], done: false });
        }
        expect(gen.next()).to.deep.equal({ done: true, value: undefined });
    });
    it('what if both are empty', () => {
        function* gen1() { }
        function* gen2() { }
        const gen = braid(gen1(), gen2());
        expect(gen.next()).to.deep.equal({ done: true, value: undefined });
    });
    it('take 3 - of the same size', () => {
        const g1 = range(0, 5);
        const g2 = range(5, 10);
        function* gen1(arr: number[]) {
            for (let i in arr) {
                yield arr[i];
            }
        }
        const gen = braid(gen1(g1), gen1(g2));
        for (let i in range(0, 5)) {
            expect(gen.next()).to.deep.equal({ value: g1[i], done: false });
            expect(gen.next()).to.deep.equal({ value: g2[i], done: false });
        }
        expect(gen.next()).to.deep.equal({ done: true, value: undefined });
    });
    it('the final test - we hate types (easy)', () => {
        const g1 = [1, false, "string", [1, 2, 3], { a: "test" }];
        const g2 = ["a"];
        function* gen1(arr: any[]) {
            for (let i in arr) {
                yield arr[i];
            }
        }
        const gen = braid(gen1(g1), gen1(g2));

        expect(gen.next()).to.deep.equal({ value: g1[0], done: false });
        expect(gen.next()).to.deep.equal({ value: g2[0], done: false });

        for (let i in range(0, 4)) {
            expect(gen.next()).to.deep.equal({ value: g1[1 + Number(i)], done: false });
        }
        expect(gen.next()).to.deep.equal({ done: true, value: undefined });
    })
    it('the final test - we hate types (uncommon)', () => {
        const g1 = [0xf00d, 0b1010, 0o744, 'string1', `string`, [1, "test", true, false], { for: "you", 2: "check" }];
        const g2 = ["b"];
        function* gen1(arr: any[]) {
            for (let i in arr) {
                yield arr[i];
            }
        }
        const gen = braid(gen1(g1), gen1(g2));

        expect(gen.next()).to.deep.equal({ value: g1[0], done: false });
        expect(gen.next()).to.deep.equal({ value: g2[0], done: false });

        for (let i in range(0, 6)) {
            expect(gen.next()).to.deep.equal({ value: g1[1 + Number(i)], done: false });
        }
        expect(gen.next()).to.deep.equal({ done: true, value: undefined });
    })
    it('the final test - we hate types (hard)', () => {
        const g1 = [0, false, [], {}, undefined, null];
        const g2 = ["S"];
        function* gen1(arr: any[]) {
            for (let i in arr) {
                yield arr[i];
            }
        }
        const gen = braid(gen1(g1), gen1(g2));

        expect(gen.next()).to.deep.equal({ value: g1[0], done: false });
        expect(gen.next()).to.deep.equal({ value: g2[0], done: false });

        for (let i in range(0, 5)) {
            expect(gen.next()).to.deep.equal({ value: g1[1 + Number(i)], done: false });
        }
        expect(gen.next()).to.deep.equal({ done: true, value: undefined });
    })
});

describe('generators q2', () => {
    it('example from assaginment', () => {
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
        const gen = biased(gen1(), gen2());
        expect(gen.next()).to.deep.equal({ value: 3, done: false });
        expect(gen.next()).to.deep.equal({ value: 6, done: false });
        expect(gen.next()).to.deep.equal({ value: 8, done: false });
        expect(gen.next()).to.deep.equal({ value: 9, done: false });
        expect(gen.next()).to.deep.equal({ value: 12, done: false });
        expect(gen.next()).to.deep.equal({ value: 10, done: false });
        gen.next();
        expect(gen.next()).to.deep.equal({ done: true, value: undefined });
    });
    it('the 2nd is longer', () => {
        const g1 = range(0, 5);
        const g2 = range(5, 13);
        function* gen1(arr: number[]) {
            for (let i in arr) {
                yield arr[i];
            }
        }
        const gen = biased(gen1(g1), gen1(g2));
        for (let i in range(0, 2)) {
            expect(gen.next()).to.deep.equal({ value: g1[Number(i) * 2], done: false });
            expect(gen.next()).to.deep.equal({ value: g1[Number(i) * 2 + 1], done: false });
            expect(gen.next()).to.deep.equal({ value: g2[Number(i)], done: false });
        }
        expect(gen.next()).to.deep.equal({ value: g1[4], done: false });
        for (let i in range(2, 8)) {
            expect(gen.next()).to.deep.equal({ value: g2[2 + Number(i)], done: false });
        }
        expect(gen.next()).to.deep.equal({ done: true, value: undefined });
    });
    it('take 2! the first is empty', () => {
        const g1 = range(0, 5);
        function* gen1() { };
        function* gen2(arr: number[]) {
            for (let i in arr) {
                yield arr[i];
            }
        };
        const gen = biased(gen1(), gen2(g1));
        for (let i in range(0, 5)) {
            expect(gen.next()).to.deep.equal({ value: g1[i], done: false });
        }
        expect(gen.next()).to.deep.equal({ done: true, value: undefined });
    });
    it('or the second instead', () => {
        const g1 = range(0, 5);
        function* gen1(arr: number[]) {
            for (let i in arr) {
                yield arr[i];
            }
        }
        function* gen2() { }
        const gen = biased(gen1(g1), gen2());
        for (let i in range(0, 5)) {
            expect(gen.next()).to.deep.equal({ value: g1[i], done: false });
        }
        expect(gen.next()).to.deep.equal({ done: true, value: undefined });
    });
    it('what if both are empty', () => {
        function* gen1() { }
        function* gen2() { }
        const gen = biased(gen1(), gen2());
        expect(gen.next()).to.deep.equal({ done: true, value: undefined });
    });
    it('take 3 - of the same size (code-wise)', () => {
        const g1 = range(0, 6);
        const g2 = range(3, 6);
        function* gen1(arr: number[]) {
            for (let i in arr) {
                yield arr[i];
            }
        }
        const gen = biased(gen1(g1), gen1(g2));
        for (let i in range(0, 3)) {
            expect(gen.next()).to.deep.equal({ value: g1[Number(i) * 2], done: false });
            expect(gen.next()).to.deep.equal({ value: g1[Number(i) * 2 + 1], done: false });
            expect(gen.next()).to.deep.equal({ value: g2[Number(i)], done: false });
        }
        expect(gen.next()).to.deep.equal({ done: true, value: undefined });
    });
    it('the final test - we hate types (easy)', () => {
        const g1 = [1, false, "string", [1, 2, 3], { a: "test" }];
        const g2 = ["a"];
        function* gen1(arr: any[]) {
            for (let i in arr) {
                yield arr[i];
            }
        }
        const gen = biased(gen1(g1), gen1(g2));

        expect(gen.next()).to.deep.equal({ value: g1[0], done: false });
        expect(gen.next()).to.deep.equal({ value: g1[1], done: false });
        expect(gen.next()).to.deep.equal({ value: g2[0], done: false });

        for (let i in range(0, 3)) {
            expect(gen.next()).to.deep.equal({ value: g1[2 + Number(i)], done: false });
        }
        expect(gen.next()).to.deep.equal({ done: true, value: undefined });
    })
    it('the final test - we hate types (uncommon)', () => {
        const g1 = [0xf00d, 0b1010, 0o744, 'string1', `string`, [1, "test", true, false], { for: "you", 2: "check" }];
        const g2 = ["b"];
        function* gen1(arr: any[]) {
            for (let i in arr) {
                yield arr[i];
            }
        }
        const gen = biased(gen1(g1), gen1(g2));

        expect(gen.next()).to.deep.equal({ value: g1[0], done: false });
        expect(gen.next()).to.deep.equal({ value: g1[1], done: false });
        expect(gen.next()).to.deep.equal({ value: g2[0], done: false });

        for (let i in range(0, 5)) {
            expect(gen.next()).to.deep.equal({ value: g1[2 + Number(i)], done: false });
        }
        expect(gen.next()).to.deep.equal({ done: true, value: undefined });
    })
    it('the final test - we hate types (hard)', () => {
        const g1 = [0, false, [], {}, undefined, null];
        const g2 = ["S"];
        function* gen1(arr: any[]) {
            for (let i in arr) {
                yield arr[i];
            }
        }
        const gen = biased(gen1(g1), gen1(g2));

        expect(gen.next()).to.deep.equal({ value: g1[0], done: false });
        expect(gen.next()).to.deep.equal({ value: g1[1], done: false });
        expect(gen.next()).to.deep.equal({ value: g2[0], done: false });

        for (let i in range(0, 4)) {
            expect(gen.next()).to.deep.equal({ value: g1[2 + Number(i)], done: false });
        }
        expect(gen.next()).to.deep.equal({ done: true, value: undefined });
    })
});
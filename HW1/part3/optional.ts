/* Question 1 */

export type Optional<T> = Some<T> | None;

type None = {
    tag: "None"
};
type Some<T> = {
    tag: "Some" ,
    value: T
};

export const makeSome : <T>(val:T) => Optional<T> = <T>(val:T) : Optional<T> => ({tag: "Some", value:val});
export const makeNone : <T>() => Optional<T> = <T>() : Optional<T> => ({tag:"None"}) ;

export const isSome : <T>(opt: Optional<T>) => boolean = <T>(opt: Optional<T>) : boolean => opt.tag === "Some";
export const isNone : <T>(opt: Optional<T>) => boolean = <T>(opt: Optional<T>) : boolean => opt.tag === "None";

/* Question 2 */
export const bind : <T,U>(opt: Optional<T>, f: (x: T) => Optional<U>) => Optional<U> = <T,U>(opt:Optional<T>, f: (x: T) => Optional<U>) : Optional<U> => isSome(opt) ? f(opt.value) : makeNone();
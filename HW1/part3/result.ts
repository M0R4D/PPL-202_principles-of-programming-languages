/* Question 3 */

export type Result<T> = Ok<T> | Failure;
type Failure = {
    tag:"Failure",
    message: string
};
type Ok<T> = {
    tag:"Ok",
    value:T
};

export const makeOk : <T>(value:T) => Result<T> = <T>(value:T): Result<T> => ({tag: "Ok", value: value});
export const makeFailure : <T>(msg:string) => Result<T> = <T>(msg:string): Result<T> => ({tag: "Failure", message: msg}); // need to edit

export const isOk : <T>(res : Result<T>) => boolean = <T>(res : Result<T>) : boolean => res.tag === "Ok" ;
export const isFailure : <T>(res : Result<T>) => boolean = <T>(res : Result<T>) : boolean => res.tag === "Failure";

/* Question 4 */
export const bind : <T,U>(res: Result<T>, f: (x: T) => Result<U>) => Result<U> = <T,U>(res: Result<T>, f: (x: T) => Result<U>) : Result<U> => isFailure(res) ? makeFailure(res.message) : f(res.value);

/* Question 5 */
interface User {
    name: string;
    email: string;
    handle: string;
}

const validateName = (user: User): Result<User> =>
    user.name.length === 0 ? makeFailure("Name cannot be empty") : 
    user.name === "Bananas" ? makeFailure("Bananas is not a name") : 
    makeOk(user);

const validateEmail = (user: User): Result<User> =>
    user.email.length === 0 ? makeFailure("Email cannot be empty") : 
    user.email.endsWith("bananas.com") ? makeFailure("Domain bananas.com is not allowed") : 
    makeOk(user);

const validateHandle = (user: User): Result<User> =>
    user.handle.length === 0 ? makeFailure("Handle cannot be empty") : 
    user.handle.startsWith("@") ? makeFailure("This isn't Twitter") : 
    makeOk(user);

export const naiveValidateUser : (user: User) => Result<User> = (user: User) : Result<User> => {
    if (isFailure(validateName(user))) {
        return validateName(user);
    }
    if (isFailure(validateEmail(user))) {
        return validateEmail(user);
    }
    if (isFailure(validateHandle(user))) {
        return validateHandle(user);
    }
    return makeOk(user);
};

export const monadicValidateUser : (user: User) => Result<User> = (user: User) : Result<User> => {
    return bind(bind(bind(makeOk(user),validateName),validateEmail),validateHandle);
};
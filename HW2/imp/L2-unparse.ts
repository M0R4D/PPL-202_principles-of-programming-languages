import { Exp, Program, isProgram, isBoolExp, isNumExp, isVarRef, isPrimOp, isDefineExp, isProcExp, isIfExp, isAppExp } from "./L2-ast";
import { map } from "ramda";
import { Result, makeOk, makeFailure, mapResult, bind, safe3, safe2 } from "./result";

export const unparseL2 = (exp: Exp | Program): Result<string> =>
    isProgram(exp) ? bind(mapResult(unparseL2, exp.exps), (exps: string[]) => makeOk(exps.join("\n"))) :
    isBoolExp(exp) ? makeOk(exp.val ? "#t" : "#f") :
    isNumExp(exp) ? makeOk(exp.val.toString()) :
    isVarRef(exp) ? makeOk(exp.var) :
    isPrimOp(exp) ? makeOk(exp.op) :
    isDefineExp(exp) ? bind(unparseL2(exp.val), (val: string) => makeOk(`(define ${exp.var} ${val})`)) :
    isProcExp(exp) ? bind(mapResult(unparseL2, exp.body), (body: string[]) => makeOk(`(lambda (${map(v => v.var, exp.args).join(" ")}) ${body.join(" ")})`)) :
    isIfExp(exp) ? safe3((test: string, then: string, alt: string) => makeOk(`(if ${test} ${then} ${alt})`))
                    (unparseL2(exp.test), unparseL2(exp.then), unparseL2(exp.alt)) :
    isAppExp(exp) ? safe2((rator: string, rands: string[]) => makeOk(`(${rator} ${rands.join(" ")})`))
                        (unparseL2(exp.rator), mapResult(unparseL2, exp.rands)) :
    makeFailure(`Unknown expression: ${exp}`);
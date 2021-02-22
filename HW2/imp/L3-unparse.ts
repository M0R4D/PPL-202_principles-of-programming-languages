import { Exp, Program, isProgram, isBoolExp, isNumExp, isVarRef, isPrimOp, isDefineExp, isProcExp, isIfExp, isAppExp, isLetExp, isStrExp, isLitExp } from "./L3-ast";
import { map, zipWith } from "ramda";
import { Result, makeOk, makeFailure, mapResult, bind, safe3, safe2 } from "./result";
import { valueToString } from "./L3-value";

export const unparseL3 = (exp: Exp | Program): Result<string> =>
    isProgram(exp) ? bind(mapResult(unparseL3, exp.exps), (exps: string[]) => makeOk(exps.join("\n"))) :
    isBoolExp(exp) ? makeOk(exp.val ? "#t" : "#f") :
    isNumExp(exp) ? makeOk(exp.val.toString()) :
    isStrExp(exp) ? makeOk(exp.val) :
    isVarRef(exp) ? makeOk(exp.var) :
    isPrimOp(exp) ? makeOk(exp.op) :
    isLitExp(exp) ? makeOk(valueToString(exp.val)) :
    isDefineExp(exp) ? bind(unparseL3(exp.val), (val: string) => makeOk(`(define ${exp.var} ${val})`)) :
    isProcExp(exp) ? bind(mapResult(unparseL3, exp.body), (body: string[]) => makeOk(`(lambda (${map(v => v.var, exp.args).join(" ")} ${body.join(" ")}))`)) :
    isIfExp(exp) ? safe3((test: string, then: string, alt: string) => makeOk(`(if ${test} ${then} ${alt})`))
                    (unparseL3(exp.test), unparseL3(exp.then), unparseL3(exp.alt)) :
    isAppExp(exp) ? safe2((rator: string, rands: string[]) => makeOk(`(${rator} ${rands.join(" ")})`))
                        (unparseL3(exp.rator), mapResult(unparseL3, exp.rands)) :
    isLetExp(exp) ? safe3((vars: string[], vals: string[], body: string[]) => makeOk(`(let (${zipWith((v, val) => `(${v} ${val})`, vars, vals)}) ${body.join(" ")})`))
                        (mapResult(b => makeOk(b.var.var), exp.bindings), mapResult(b => unparseL3(b.val), exp.bindings), mapResult(unparseL3, exp.body)) :
    makeFailure(`Unknown expression: ${exp}`);
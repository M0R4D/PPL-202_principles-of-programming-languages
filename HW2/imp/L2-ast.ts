// L2 Parser
// =========

// A parser provides 2 components to the clients:
// - Type definitions for the AST of the language (with type predicates, constructors, getters)
// - A parser function which constructs AST values from strings.

import { map } from 'ramda';
import { isString, isArray, isNumericString, isIdentifier } from './type-predicates';
import { first, rest, second, isEmpty, allT } from './list';
import { Result, makeOk, makeFailure, bind, mapResult, safe2 } from "./result";

// ===============
// AST type models

/*
;; =============================================================================
;; Scheme Parser
;;
;; L2 extends L1 with support for IfExp and ProcExp
;; <program> ::= (L2 <exp>+) // Program(exps:List(Exp))
;; <exp> ::= <define> | <cexp>              / DefExp | CExp
;; <define> ::= ( define <var> <cexp> )     / DefExp(var:VarDecl, val:CExp)
;; <var> ::= <identifier>                   / VarRef(var:string)
;; <cexp> ::= <number>                      / NumExp(val:number)
;;         |  <boolean>                     / BoolExp(val:boolean)
;;         |  ( lambda ( <var>* ) <cexp>+ ) / ProcExp(params:VarDecl[], body:CExp[]))
;;         |  ( if <cexp> <cexp> <cexp> )   / IfExp(test: CExp, then: CExp, alt: CExp)
;;         |  ( <cexp> <cexp>* )            / AppExp(operator:CExp, operands:CExp[]))
;; <prim-op>  ::= + | - | * | / | < | > | = | not |  and | or | eq?
;;                  number? | boolean? ##### L2
;; <num-exp>  ::= a number token
;; <bool-exp> ::= #t | #f
;; <var-ref>  ::= an identifier token
;; <var-decl> ::= an identifier token
*/

// A toplevel expression in L2 - can appear in a program
export type Exp = DefineExp | CExp;
export type AtomicExp = NumExp | BoolExp | PrimOp | VarRef;
export type CompoundExp = AppExp | IfExp | ProcExp;
export type CExp =  AtomicExp | CompoundExp;

export interface Program {tag: "Program"; exps: Exp[]; }

export interface DefineExp {tag: "DefineExp"; var: VarDecl; val: CExp; }
export interface NumExp {tag: "NumExp"; val: number; }
export interface BoolExp {tag: "BoolExp"; val: boolean; }
export interface PrimOp {tag: "PrimOp", op: string; }
export interface VarRef {tag: "VarRef", var: string; }
export interface VarDecl {tag: "VarDecl", var: string; }
export interface AppExp {tag: "AppExp", rator: CExp, rands: CExp[]; }
// L2
export interface IfExp {tag: "IfExp"; test: CExp; then: CExp; alt: CExp; };
export interface ProcExp {tag: "ProcExp"; args: VarDecl[], body: CExp[]; };

// Type value constructors for disjoint types
export const makeProgram = (exps: Exp[]): Program => ({tag: "Program", exps: exps});
export const makeDefineExp = (v: VarDecl, val: CExp): DefineExp =>
    ({tag: "DefineExp", var: v, val: val});
export const makeNumExp = (n: number): NumExp => ({tag: "NumExp", val: n});
export const makeBoolExp = (b: boolean): BoolExp => ({tag: "BoolExp", val: b});
export const makePrimOp = (op: string): PrimOp => ({tag: "PrimOp", op: op});
export const makeVarRef = (v: string): VarRef => ({tag: "VarRef", var: v});
export const makeVarDecl = (v: string): VarDecl => ({tag: "VarDecl", var: v});
export const makeAppExp = (rator: CExp, rands: CExp[]): AppExp =>
    ({tag: "AppExp", rator: rator, rands: rands});
// L2
export const makeIfExp = (test: CExp, then: CExp, alt: CExp): IfExp =>
    ({tag: "IfExp", test: test, then: then, alt: alt});
export const makeProcExp = (args: VarDecl[], body: CExp[]): ProcExp =>
    ({tag: "ProcExp", args: args, body: body});

// Type predicates for disjoint types
export const isProgram = (x: any): x is Program => x.tag === "Program";
export const isDefineExp = (x: any): x is DefineExp => x.tag === "DefineExp";
export const isNumExp = (x: any): x is NumExp => x.tag === "NumExp";
export const isBoolExp = (x: any): x is BoolExp => x.tag === "BoolExp";
export const isPrimOp = (x: any): x is PrimOp => x.tag === "PrimOp";
export const isVarRef = (x: any): x is VarRef => x.tag === "VarRef";
export const isVarDecl = (x: any): x is VarDecl => x.tag === "VarDecl";
export const isAppExp = (x: any): x is AppExp => x.tag === "AppExp";
// L2
export const isIfExp = (x: any): x is IfExp => x.tag === "IfExp";
export const isProcExp = (x: any): x is ProcExp => x.tag === "ProcExp";

// Type predicates for type unions
export const isExp = (x: any): x is Exp => isDefineExp(x) || isCExp(x);
export const isAtomicExp = (x: any): x is AtomicExp =>
    isNumExp(x) || isBoolExp(x) ||
    isPrimOp(x) || isVarRef(x);
export const isCompoundExp = (x: any): x is CompoundExp =>
    isAppExp(x) || isIfExp(x) || isProcExp(x);
export const isCExp = (x: any): x is CExp =>
    isAtomicExp(x) || isCompoundExp(x);

// ========================================================
// Parsing

// Make sure to run "npm install ramda s-expression --save"
import { Sexp, Token } from "s-expression";
import { parse as parseSexp, isToken } from "./parser";

// combine Sexp parsing with the L2 parsing
export const parseL2 = (x: string): Result<Program> =>
    bind(parseSexp(x), parseL2Program);

// L2 concrete syntax
// <Program> -> (L2 <Exp>+)
// <Exp> -> <DefineExp> | <CExp>
// <DefineExp> -> (define <VarDecl> <CExp>)
// <CExp> -> <AtomicExp> | <CompoundExp>
// <AtomicExp> -> <number> | <boolean> | <PrimOp> | <VarRef>
// <CompoundExp> -> <AppExp> | <IfExp> | <ProcExp>
// <AppExp> -> (<CExp>+)
// <IfExp> -> (if <CExp> <CExp> <CExp>)
// <ProcExp> -> (lambda (<VarDecl>*) <CExp>+)

// <Program> -> (L2 <Exp>+)
export const parseL2Program = (sexp: Sexp): Result<Program> =>
    sexp === "" || isEmpty(sexp) ? makeFailure("Unexpected empty program") :
    isToken(sexp) ? makeFailure("Program cannot be a single token") :
    isArray(sexp) ? parseL2GoodProgram(first(sexp), rest(sexp)) :
    makeFailure("Unexpected type " + sexp);

const parseL2GoodProgram = (keyword: Sexp, body: Sexp[]): Result<Program> =>
    keyword === "L2" && !isEmpty(body) ? bind(mapResult(parseL2Exp, body),
                                              (exps: Exp[]) => makeOk(makeProgram(exps))) :
    makeFailure("Program must be of the form (L2 <exp>+)");

// <Exp> -> <DefineExp> | <CExp>
export const parseL2Exp = (sexp: Sexp): Result<Exp> =>
    isEmpty(sexp) ? makeFailure("Exp cannot be an empty list") :
    isArray(sexp) ? parseL2CompoundExp(first(sexp), rest(sexp)) :
    isToken(sexp) ? parseL2Atomic(sexp) :
    makeFailure("Unexpected type " + sexp);

// <CompoundExp> -> <DefineExp> | <CompoundCExp>
export const parseL2CompoundExp = (op: Sexp, params: Sexp[]): Result<Exp> => 
    op === "define"? parseDefine(params) :
    parseL2CompoundCExp(op, params);

// <CompoundCExp> -> <AppExp> | <IfExp> | <ProcExp>
export const parseL2CompoundCExp = (op: Sexp, params: Sexp[]): Result<CExp> =>
    op === "if" ? parseIfExp(params) :
    op === "lambda" ? parseProcExp(first(params), rest(params)) :
    parseAppExp(op, params);

// <DefineExp> -> (define <VarDecl> <CExp>)
export const parseDefine = (params: Sexp[]): Result<DefineExp> =>
    isEmpty(params) ? makeFailure("define missing 2 arguments") :
    isEmpty(rest(params)) ? makeFailure("define missing 1 arguments") :
    ! isEmpty(rest(rest(params))) ? makeFailure("define has too many arguments") :
    parseGoodDefine(first(params), second(params));

const parseGoodDefine = (variable: Sexp, val: Sexp): Result<DefineExp> =>
    ! isIdentifier(variable) ? makeFailure("First arg of define must be an identifier") :
    bind(parseL2CExp(val),
         (value: CExp) => makeOk(makeDefineExp(makeVarDecl(variable), value)));

// <CExp> -> <AtomicExp> | <CompondCExp>
export const parseL2CExp = (sexp: Sexp): Result<CExp> =>
    isEmpty(sexp) ? makeFailure("CExp cannot be an empty list") :
    isArray(sexp) ? parseL2CompoundCExp(first(sexp), rest(sexp)) :
    isToken(sexp) ? parseL2Atomic(sexp) :
    makeFailure("Unexpected type " + sexp);

// <Atomic> -> <number> | <boolean> | <PrimOp> | <VarRef>
export const parseL2Atomic = (token: Token): Result<CExp> =>
    token === "#t" ? makeOk(makeBoolExp(true)) :
    token === "#f" ? makeOk(makeBoolExp(false)) :
    isString(token) && isNumericString(token) ? makeOk(makeNumExp(+token)) :
    isString(token) && isPrimitiveOp(token) ? makeOk(makePrimOp(token)) :
    isString(token) ? makeOk(makeVarRef(token)) :
    makeFailure("Invalid atomic token: " + token);

export const isPrimitiveOp = (x: string): boolean =>
    ["+", "-", "*", "/", ">", "<", "=", "not", "and", "or",
     "eq?","number?", "boolean?"].includes(x);

// <AppExp> -> (<CExp>+)
export const parseAppExp = (op: Sexp, params: Sexp[]): Result<CExp> =>
    safe2((rator: CExp, rands: CExp[]) => makeOk(makeAppExp(rator, rands)))
        (parseL2CExp(op), mapResult(parseL2CExp, params));

// <IfExp> -> (if <CExp> <CExp> <CExp>)
const parseIfExp = (params: Sexp[]): Result<IfExp> =>
    params.length !== 3 ? makeFailure("Expression not of the form (if <cexp> <cexp> <cexp>)") :
    bind(mapResult(parseL2CExp, params),
         (cexps: CExp[]) => makeOk(makeIfExp(cexps[0], cexps[1], cexps[2])));

// <ProcExp> -> (lambda (<VarDecl>*) <CExp>+)
const parseProcExp = (vars: Sexp, body: Sexp[]): Result<ProcExp> =>
    isArray(vars) && allT(isIdentifier, vars) ?
        bind(mapResult(parseL2CExp, body),
             (cexps: CExp[]) => makeOk(makeProcExp(map(makeVarDecl, vars), cexps))) :
    makeFailure("Invalid vars for ProcExp");
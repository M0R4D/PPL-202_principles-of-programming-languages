// import { map, zipWith } from "ramda";
import { Result, makeOk, makeFailure, bind, mapResult, safe2, isOk } from "../shared/result";
import { rest, first } from "../shared/list";
import { Parsed, NumExp, makeNumExp, Exp, CExp, isCompoundExp, isAtomicExp, PrimOp, LetrecExp, DefineExp, 
         BoolExp, ProcExp, AppExp, SetExp, Program, StrExp, LitExp, LetExp, IfExp, VarRef, parseL4, isExp, VarDecl, AtomicExp, CompoundExp, isVarDecl, Binding } from './L4-ast'
import { Graph, GraphContent, AtomicGraph, CompoundGraph, makeGraph, makeEdge, makeNodeDecl, 
         isEdge, isEdgeLabel, isAtomicGraph, isCompoundGraph, isGraph, isNodeDecl, isNodeRef, 
         EdgeLabel, Node, Edge, makeEdgeLabel, NodeDecl, makeCompoundGraph, makeNodeRef, NodeRef } from './mermaid-ast' 
import { isBoolExp, isNumExp, isStrExp, isLitExp, isVarRef, isProcExp, isAppExp, isPrimOp, isLetExp,
         isIfExp, isLetrecExp, isSetExp, isDefineExp, isProgram } from './L4-ast'
import './mermaid-ast'
import './L4-ast'

// ------------------------------------- Part 2.2 ------------------------------

// every node id must be unique, we should implement this function that gives every node its unique name
// export type Parsed = Exp | Program;
export const mapL4toMermaid = (exp: Parsed) : Result<Graph> =>
    makeOk(makeGraph({tag: "TD"}, bind(exp, mapL4toMermaid2)));

export const mapL4toMermaid2 = (exp: Parsed): Result<GraphContent> => 
    isDefineExp(exp) ? makeOk(defineToMermaid(exp)) : 
    isCompoundExp(exp) ? makeOk(compoundToMermaid(exp)) :
    isAtomicExp(exp) ? makeOk(atomicToMermaid(exp)) :
    makeFailure("bad Program");

export const defineToMermaid = (exp: DefineExp) : GraphContent => {
    // got a defineExp, declare a curr nodeDecl and send the var & val to recursive function, returns a current node
    // "DefineExp_$(number) [DefineExp] -->|var| Var_$(num)[...]"
    // "DefineExp_$(number) -->|val| [...]"
    const currNodeDecl: NodeDecl = makeNodeDecl(`DefineExp_${addNumber()}`, "DefineExp")
    return isAtomicExp(exp.val) ? makeCompoundGraph([
        makeEdge(currNodeDecl, makeNodeDecl(`Var_${addNumber()}`,`VarDecl(${exp.var.var})`),makeEdgeLabel("var")), 
        makeEdge(currNodeDecl, atomicToMermaid(exp.val).node, makeEdgeLabel("val")) //nodedecl duplicated
    ]) :
    makeCompoundGraph([
        makeEdge(currNodeDecl, makeNodeDecl(`Var_${addNumber()}`,`VarDecl(${exp.var.var})`) /*VarDeclToMermaid(exp.var)*/, 
                    makeEdgeLabel("var")) , 
        makeEdge(makeNodeRef(currNodeDecl.id), compoundToMermaid(exp.val).edges[0].from /*CExpToMermaid(exp.val)*/, 
                    makeEdgeLabel("val"))
        // if there is a problem with duplicate node declaration we should fix here the index
    ]);
} 

export const atomicToMermaid = (exp: AtomicExp | VarDecl) : AtomicGraph => 
    isNumExp(exp) ? numToMermaid(exp) :
    isBoolExp(exp) ? boolToMermaid(exp) :
    isStrExp(exp) ? strToMermaid(exp) :
    isPrimOp(exp) ? primeOpToMermaid(exp) :
    isVarRef(exp) ? varRefToMermaid(exp) :
    isVarDecl(exp) ? varDeclToMermaid(exp) : 
    makeAtomicGraph();

export const compoundToMermaid = (exp: CompoundExp) : CompoundGraph => 
    // export type CompoundExp = AppExp | IfExp | ProcExp | LetExp | LitExp | LetrecExp | SetExp;
    // AppExp & ProcExp & LetExp & LetrecExp must have a [":"] node in there graph
    isAppExp(exp) ? appToMermaid(exp) :
    isIfExp(exp) ? ifToMermaid(exp) :
    isProcExp(exp) ? procToMermaid(exp) :
    isLetExp(exp) ? letToMermaid(exp) :
    isLitExp(exp) ? litToMermaid(exp) :
    isLetrecExp(exp) ? letRecToMermaid (exp) :
    /*isSetExp(exp) ?*/ setToMermaid(exp);
    


// GraphContent return type should be removed
export const numToMermaid = (exp: NumExp) : NodeDecl => 
    // makeNodeDecl(`${exp.tag}_${addNumber()}`, `${exp.tag}(${exp.val})`);
    makeNodeDecl(`NumExp_${addNumber()}`, `${exp.tag}(${exp.val})`); // maybe here should be makeEdge

export const boolToMermaid = (exp: BoolExp) : NodeDecl => 
    makeNodeDecl(`BoolExp_${addNumber()}`, `${exp.tag}(${exp.val})`); 

export const strToMermaid = (exp: StrExp) : NodeDecl => 
    makeNodeDecl(`StrExp_${addNumber()}`, `${exp.tag}(${exp.val})`); 

export const varDeclToMermaid = (exp: VarDecl) : NodeDecl => 
    makeNodeDecl(`VarDecl_${addNumber()}`, `${exp.tag}(${exp.var})`); 

export const varRefToMermaid = (exp: VarRef) : NodeDecl =>
    makeNodeDecl(`VarRef_${addNumber()}`, `${exp.tag}(${exp.var})`); 

export const primeOpToMermaid = (exp: PrimOp) : NodeDecl => 
    makeNodeDecl(`PrimeOp_${addNumber()}`, `${exp.tag}(${exp.op})`);




export const appToMermaid = (exp: AppExp) : CompoundGraph => {
    // export interface AppExp {tag: "AppExp"; rator: CExp; rands: CExp[]; }
    const node : Node = makeNodeDecl(`AppExp_${addNumber()}`, `${exp.tag}`);
    makeCompoundGraph([
        makeEdge(node, isAtomicExp(exp.rator) ? atomicToMermaid(exp.rator).node : compoundToMermaid(exp.rator).edges[0].from, makeEdgeLabel("rator")), 
        makeEdge(node, CExpToMermaid(exp.rands), makeEdgeLabel("rands"))
    ]);
} ////////////////////////////////////////////////////////////////////


export const procToMermaid = (exp: ProcExp) : CompoundGraph => {
    // export interface ProcExp {tag: "ProcExp"; args: VarDecl[], body: CExp[]; }
    const node : Node = makeNodeDecl(`ProcExp_${addNumber()}`, `${exp.tag}`);
    return makeCompoundGraph([
        makeEdge(node, CExpToMermaid(exp.args), makeEdgeLabel("args")), 
        makeEdge(node, CExpToMermaid(exp.body), makeEdgeLabel("body"))
    ]);
}

// ----------------------------- Done ---------------------------
export const ifToMermaid = (exp: IfExp) : CompoundGraph => {
    const currNodeDecl: NodeDecl = makeNodeDecl(`${exp.tag}_${addNumber()}`, "IfExp");
    return makeCompoundGraph([
        makeEdge(currNodeDecl, isAtomicExp(exp.test) ? atomicToMermaid(exp.test).node : compoundToMermaid(exp.test).edges[0].from, makeEdgeLabel("test")) ,
        makeEdge(makeNodeRef(currNodeDecl.id), isAtomicExp(exp.then) ? atomicToMermaid(exp.then).node : compoundToMermaid(exp.then).edges[0].from, makeEdgeLabel("then")) ,
        makeEdge(makeNodeRef(currNodeDecl.id), isAtomicExp(exp.alt) ? atomicToMermaid(exp.alt).node : compoundToMermaid(exp.alt).edges[0].from, makeEdgeLabel("alt")) ,
    ]);
}

export const letToMermaid = (exp: LetExp) : CompoundGraph =>;
export const litToMermaid = (exp: LitExp) : CompoundGraph => {
    // interface LitExp {tag: "LitExp"; val: SExpValue; }
    const currNodeDecl : NodeDecl = makeNodeDecl(`LitExp${addNumber()}`, `${exp.tag}`);
    const currNodeRef: NodeRef = makeNodeRef(currNodeDecl.id);
    makeNodeDecl()

}
export const letRecToMermaid = (exp: LetrecExp) : CompoundGraph =>; 

// --------------------------- Done --------------------------
export const setToMermaid = (exp: SetExp) : CompoundGraph => {
    // interface SetExp {tag: "SetExp", var: VarRef; val: CExp; }
    const currNodeDecl: NodeDecl = makeNodeDecl(`${exp.tag}_${addNumber()}`, "SetExp");
    const currNodeRef: NodeRef = makeNodeRef(currNodeDecl.id);
    return makeCompoundGraph([
        makeEdge(currNodeDecl, varRefToMermaid(exp.var) , makeEdgeLabel("var")) ,
        makeEdge(currNodeRef, isAtomicExp(exp.val) || isVarDecl(exp.val) ? atomicToMermaid(exp.val).node : compoundToMermaid(exp.val).edges[0].from, makeEdgeLabel("val"))
    ]);
}

export const bindingToMermaid = (exp: Binding) : GraphContent => {
    const currNodeDecl: NodeDecl = makeNodeDecl(`Binding_${addNumber()}`, "Binding")
    return isAtomicExp(exp.val) ? makeCompoundGraph([
        makeEdge(currNodeDecl, makeNodeDecl(`Var_${addNumber()}`,`VarDecl(${exp.var.var})`),makeEdgeLabel("var")), 
        makeEdge(makeNodeRef(currNodeDecl.id), atomicToMermaid(exp.val).node, makeEdgeLabel("val"))
    ]) :
    makeCompoundGraph([
        makeEdge(currNodeDecl, makeNodeDecl(`Var_${addNumber()}`,`VarDecl(${exp.var.var})`) /*VarDeclToMermaid(exp.var)*/, 
                    makeEdgeLabel("var")) , 
        makeEdge(makeNodeRef(currNodeDecl.id), compoundToMermaid(exp.val).edges[0].from /*CExpToMermaid(exp.val)*/, 
                    makeEdgeLabel("val"))
        // if there is a problem with duplicate node declaration we should fix here the index
    ]);
} 

export const CExpToMermaid = (exp: CExp) : /*GraphContent*/ | Node => { // maybe shouldn't be used OR should be changed so it returns Node
    // case 1: 
    isAtomicExp(exp) ? atomicToMermaid(exp) : compoundToMermaid(exp);
    // case 2:
    return isAtomicExp(exp) ? atomicToMermaid(exp).node : compoundToMermaid(exp).edges[0].from;
}

export const programToMermaid = (exp: Program) : GraphContent => {
    // interface Program {tag: "Program"; exps: Exp[]; }
    const currNodeDecl: NodeDecl = makeNodeDecl(`${exp.tag}_${addNumber()}`, "Program");
    const currNodeRef: NodeRef = makeNodeRef(currNodeDecl.id);

}

export const twoDotsLabel = (exp: Exp[] | Binding[]) : GraphContent => {
    const currNodeDecl: NodeDecl = makeNodeDecl(`${exp.tag}_${addNumber()}`, "[:]");
    const currNodeRef: NodeRef = makeNodeRef(currNodeDecl.id);

}

export const addNumber = () : number => Math.random() * 1000000; 

// ----------------------------- Part 2.3 -----------------------------------
export const unparseMermaid = (exp: Graph): Result<string> => 
    isGraph(exp) ? makeOk(unparseGraph(exp)) : 
    makeFailure("exp isn't ligal Graph");

export const unparseMermaid2 = (exp: Node | GraphContent | Edge |EdgeLabel): Result<string> => 
    isNodeDecl(exp) ? makeOk(unparseNode(exp)) : // Done
    isNodeRef(exp) ? makeOk(unparseNode(exp)) : //Done
    isEdge(exp) ? makeOk(`${unparseNode(exp.from)} -->${unparseEdgeLabel(exp.label)} ${unparseNode(exp.to)}`) : // Done
    isEdgeLabel(exp) ? makeOk(unparseEdgeLabel(exp)) : // Done
    isAtomicGraph(exp) ? makeOk(unparseNode(exp.node)) : // Done
    isCompoundGraph(exp) ? makeOk(unparseCompoundGraph(exp.edges)) : // Done
    makeFailure("Fail");

export const unparseGraph = (graph: Graph) : string => 
    `graph ${graph.dir.tag} \n${unparseGraphContent(graph.content)}`; // Done

export const unparseGraphContent = (exp: GraphContent): string => 
    isAtomicGraph(exp) ? unparseNode(exp.node) : // Done
    isCompoundGraph(exp) ? unparseCompoundGraph(exp.edges) : // Done
    "Fail";

export const unparseCompoundGraph = (edges: Edge[]) : string => 
    // edges.length === 1 ? unparseEdge(edges[0]) : unparseCompoundGraph(rest(edges))
    edges.length === 1 ? unparseEdge(first(edges)) : 
    `${unparseEdge(first(edges))} ${unparseCompoundGraph(rest(edges))}`;

export const unparseEdge = (edge: Edge) : string =>
    `${unparseNode(edge.from)} -->${unparseEdgeLabel(edge.label)} ${unparseNode(edge.to)}\n`;

export const unparseEdgeLabel = (label: EdgeLabel | undefined) : string => 
    label == undefined ? "" : `|${label.ident}|`;

export const unparseNode = (node: Node) : string => 
    isNodeRef(node) ? `${node.id}` : 
    `${node.id}[${node.label}]`;

// ------------------------------------------------------------------------------

export const L4toMermaid = (concrete: string): Result<string> => 
    // parseL4(concrete) // gets string, returns Result<Program>
    // mapL4toMermaid // gets Parsed L4 (L4-ast), returns Result<Graph>
    // unparseMermaid // gets Mermaid Graph, returns Result<string>
    // should use safe2 or bind functions but thats what I did
    // (unparseMermaid(mapL4toMermaid(parseL4(concrete).value).value));
    // safe2(parseL4(concrete), mapL4toMermaid)
    // bind(bind(concrete,parseL4), mapL4toMermaid)
    bind(bind(parseL4(concrete), mapL4toMermaid), unparseMermaid);
    
// ----------------------------- end of Part 2.3 --------------------------------

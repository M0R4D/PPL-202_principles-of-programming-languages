import { Result, makeOk, makeFailure, bind, mapResult, safe2, isOk } from "../shared/result";
import { rest, first } from "../shared/list";
import { Parsed, NumExp, makeNumExp, Exp, CExp, isCompoundExp, isAtomicExp, PrimOp, LetrecExp, DefineExp, 
         BoolExp, ProcExp, AppExp, SetExp, Program, StrExp, LitExp, LetExp, IfExp, VarRef, parseL4, isExp, VarDecl, AtomicExp, CompoundExp } from './L4-ast'
import { Graph, GraphContent, AtomicGraph, CompoundGraph, makeGraph, makeEdge, makeNodeDecl, 
         isEdge, isEdgeLabel, isAtomicGraph, isCompoundGraph, isGraph, isNodeDecl, isNodeRef, 
         EdgeLabel, Node, Edge, makeEdgeLabel, NodeDecl, makeCompoundGraph, makeAtomicGraph } from './mermaid-ast' 
import { isBoolExp, isNumExp, isStrExp, isLitExp, isVarRef, isProcExp, isAppExp, isPrimOp, isLetExp,
         isIfExp, isLetrecExp, isSetExp, isDefineExp, isProgram } from './L4-ast'
import { mapL4toMermaid } from "./mermaid";

// ----------------------------- Part 2.3 -----------------------------------
export const unparseMermaid = (exp: Graph): Result<string> => 
    isGraph(exp) ? makeOk(unparseGraph(exp)) : 
    makeFailure("Illegal Graph");

export const unparseMermaid2 = (exp: Node | GraphContent | Edge |EdgeLabel): Result<string> => 
    isNodeDecl(exp) ? makeOk(unparseNode(exp)) : // Done
    isNodeRef(exp) ? makeOk(unparseNode(exp)) : //Done
    isEdge(exp) ? makeOk(`${unparseNode(exp.from)} -->${unparseEdgeLabel(exp.label)} ${unparseNode(exp.to)}`) : // Done
    isEdgeLabel(exp) ? makeOk(unparseEdgeLabel(exp)) : // Done
    isAtomicGraph(exp) ? makeOk(unparseNode(exp.node)) : // Done
    isCompoundGraph(exp) ? makeOk(unparseCompoundGraph(exp.edges)) : // Done
    makeFailure("Fail");

export const unparseGraph = (graph: Graph) : string => 
    `graph ${graph.dir} \n${unparseGraphContent(graph.content)}`; // Done

export const unparseGraphContent = (exp: GraphContent): string => 
    isAtomicGraph(exp) ? unparseNode(exp.node) : // Done
    isCompoundGraph(exp) ? unparseCompoundGraph(exp.edges) : // Done
    "Fail (will never reach here)";

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

export const L4toMermaid = (concrete: string): Result<string> => {
    // parseL4(concrete) // gets string, returns Result<Program>
    // mapL4toMermaid // gets Parsed L4 (L4-ast), returns Result<Graph>
    // unparseMermaid // gets Mermaid Graph, returns Result<string>
    // should use safe2 or bind functions but thats what I did
    
    return bind(bind(parseL4(concrete), mapL4toMermaid), unparseMermaid);
    // const a1 : Result<Program> = parseL4(concrete);
    // const a2 : Result<Graph> = isFailure(a1) ? makeFailure("") : mapL4toMermaid(a1.value);
    // const a3 : Result<string> = isFailure(a2) ? makeFailure("") : unparseMermaid(a2.value);
    // return a3;
}
    
// ----------------------------- end of Part 2.3 --------------------------------

const g1: Graph = {tag: "Graph", dir: {tag: "TD"}, content: {tag:"AtomicGraph", node: {tag: "NodeDecl", id: "A", label: "DefineExp"}}}
/* expected output:
graph TD 
    DefineExp_1[DefineExp]
*/

const g2: Graph = makeGraph({tag: "TD"}, {tag: "CompoundGraph", edges: [
    {tag: "Edge", from: { tag: "NodeDecl", id: "A", label: "Go Shopping" }, to: { tag: "NodeDecl", id: "B", label: "Laptop" }, label: { tag: "EdgeLabel", ident: "One" }} ,
    {tag: "Edge", from: { tag: "NodeRef", id: "A" }, to: {tag: "NodeDecl", id: "C", label: "iPhone" }, label: { tag: "EdgeLabel", ident: "Two" }}
]} );
/* expected output: 
graph TD 
    A[Go Shopping] -->|One| B[Laptop]
    A -->|Two| C[iPhone]
*/

console.log(unparseMermaid(g1));
console.log(unparseMermaid(g2));

const h1 = makeIfExp({tag: "AppExp", 
                        rator: {tag: "PrimOp", op: ">"}, 
                        rands: [{tag: "VarRef", var: "x"}, 
                                {tag: "NumExp", val: 5}]},
            {tag:"NumExp", val : 4} , 
            {tag:"NumExp", val: 5}
    );


const f2 = "(define my-list '(1 2))"
const f1 = "(lambda (x y) ((lambda (x) (+ x y)) (+ x x)) 1)"

console.log(mapL4toMermaid(h1));
const x = mapL4toMermaid(h1);
console.log( isOk(x) ? unparseMermaid(x.value) : "fail" );
console.log(L4toMermaid(f1));
console.log(L4toMermaid(f2));
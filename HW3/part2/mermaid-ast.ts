/*
;; <graph>         ::= <header> <graphContent>                  // Graph(dir: Dir, content: GraphContent)
;; <header>        ::= graph (TD|LR)<newline>                   // Direction can be TD or LR
;; <graphContent>  ::= <atomicGraph> | <compoundGraph>
;; <atomicGraph>   ::= <nodeDecl>
;; <compoundGraph> ::= <edge>+
;; <edge>          ::= <node> --><edgeLabel>? <node><newline>   // <edgeLabel> is optional
                                                                // Edge(from: Node, to: Node, label?: string)
;; <node>          ::= <nodeDecl> | <nodeRef>
;; <nodeDecl>      ::= <identifier>["<string>"]                 // NodeDecl(id: string, label: string)
;; <nodeRef>       ::= <identifier>                             // NodeRef(id: string)
<edgeLabel>        ::= |<identifier>|                           // string
*/

// ----------------------------- Part 2.1 --------------------------------
export type GraphContent = AtomicGraph | CompoundGraph;
export type Node = NodeDecl | NodeRef;
export type Dir = TD | LR;

// export interface Header {tag: "Header"; }
export interface Graph {tag: "Graph"; dir: Dir; content: GraphContent; }
export interface CompoundGraph {tag: "CompoundGraph"; edges: Edge[]; }
export interface AtomicGraph {tag: "AtomicGraph"; node: NodeDecl; }
export interface Edge {tag: "Edge"; from: Node; to: Node; label?: EdgeLabel; } 
export interface EdgeLabel {tag: "EdgeLabel"; ident: string; }
export interface NodeDecl {tag: "NodeDecl"; id: string; label: string; }
export interface NodeRef {tag: "NodeRef"; id: string; }
export interface TD {tag: "TD"; }
export interface LR {tag: "LR"; }

// type value constructors
export const makeGraph = (dir: Dir, content: GraphContent): Graph => 
    ({tag: "Graph", dir: dir, content: content});
export const makeCompoundGraph = (edges: Edge[]): CompoundGraph => ({tag: "CompoundGraph", edges: edges});
export const makeAtomicGraph = (node: NodeDecl): AtomicGraph => ({tag: "AtomicGraph", node: node});
export const makeEdge = (from: Node, to:Node, label: EdgeLabel ): Edge => ({tag: "Edge", from: from, to: to, label: label});
export const makeEdgeLabel = (ident: string): EdgeLabel => ({tag: "EdgeLabel", ident: ident});
export const makeNodeDecl = (id: string, label: string): NodeDecl => ({tag: "NodeDecl", id: id, label: label});
export const makeNodeRef = (id: string): NodeRef => ({tag: "NodeRef", id: id});

// type predicates
export const isGraph = (x: any): x is Graph => x.tag === "Graph";
export const isCompoundGraph = (x: any): x is CompoundGraph => x.tag === "CompoundGraph";
export const isAtomicGraph = (x: any): x is AtomicGraph => x.tag === "AtomicGraph";
export const isEdge = (x: any): x is Edge => x.tag === "Edge";
export const isEdgeLabel = (x: any): x is EdgeLabel => x.tag === "EdgeLabel";
export const isNodeDecl = (x: any): x is NodeDecl => x.tag === "NodeDecl";
export const isNodeRef = (x: any): x is NodeRef => x.tag === "NodeRef";

export const isDir = (x: any): x is Dir => x.tag === "TD" || x.tag === "LD";
export const isGraphContent = (x: any): x is GraphContent => 
    isAtomicGraph(x) || isCompoundGraph(x);
export const isNode = (x: any): x is Node => 
    isNodeDecl(x) || isNodeRef(x);
// ----------------------------- end of Part 2.1 --------------------------------

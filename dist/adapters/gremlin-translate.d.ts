import type { ExpectedFailurePattern, SuppressibleFamily } from '../types';
/** Minimal subset of a Gremlin attack object that the translator consumes.
 *  Integrators may pass a fuller object (Gremlin's payload also carries
 *  target/stage/output fields) — the translator reads only the fields
 *  named here. */
export interface GremlinAttack {
    guid?: string;
    type: string;
    length: number;
    magnitude?: number;
    target?: unknown;
}
/** Per-attack-type classification: the (kind, affected_signals,
 *  suppress_families) the operator expects the injected fault to produce —
 *  the detector family that should suppress during the fault window. */
interface GremlinClassification {
    kind: string;
    affected_signals: string[];
    suppress_families: SuppressibleFamily[];
}
/** Classify a Gremlin attack type → (kind, affected_signals,
 *  suppress_families). Unknown types fall through to a generic
 *  `gremlin_<type>` kind with no suppression (every fire is unexpected),
 *  mirroring the Chaos Mesh classifier's `chaos_<kind>` fallthrough. */
export declare function classifyGremlinAttack(attackType: string): GremlinClassification;
/** Translate a fetched Gremlin attack object into the canonical
 *  ExpectedFailurePattern that the orchestrator consumes via
 *  OrchestrateParams.expectedFailurePattern. `nowUnixSeconds` is the
 *  fault-start timestamp; pass `Date.now() / 1000` for live runs or a
 *  fixed value for replay determinism. Network-free — same discipline
 *  as translateChaosMeshSpec. */
export declare function translateGremlinAttack(attack: GremlinAttack, nowUnixSeconds: number): ExpectedFailurePattern;
export {};
//# sourceMappingURL=gremlin-translate.d.ts.map
import type { ExpectedFailurePattern } from '../types';
/** Minimal subset of a Chaos Mesh CRD's YAML shape that the translator
 *  consumes. Integrators may pass a fuller object — the translator
 *  reads only the fields named here. */
export interface ChaosMeshCRD {
    apiVersion: string;
    kind: string;
    metadata?: {
        name?: string;
        namespace?: string;
    };
    spec: {
        action?: string;
        duration?: string;
        stressors?: {
            cpu?: {
                workers: number;
                load?: number;
            };
            memory?: {
                workers: number;
                size?: string;
            };
        };
        delay?: {
            latency?: string;
        };
        selector?: unknown;
    };
}
/** Parse a Go duration string (e.g. '60s', '5m', '1h30m') into seconds.
 *  Implementation supports the subset Chaos Mesh's API uses; full Go
 *  duration parsing (with negative durations, sub-second units) is out
 *  of scope at v1 — chaos experiments are seconds-to-minutes scale. */
export declare function parseGoDurationSeconds(s: string): number;
/** Translate a parsed Chaos Mesh CRD object into the canonical
 *  ExpectedFailurePattern that the orchestrator consumes via
 *  OrchestrateParams.expectedFailurePattern. `nowUnixSeconds` is the
 *  fault-start timestamp; pass `Date.now() / 1000` for live runs or
 *  a fixed value for replay determinism. */
export declare function translateChaosMeshSpec(crd: ChaosMeshCRD, nowUnixSeconds: number): ExpectedFailurePattern;
//# sourceMappingURL=chaos-mesh-translate.d.ts.map
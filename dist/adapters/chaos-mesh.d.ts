import type { ChaosOrchestrationAdapter, ExpectedFailurePattern, ChaosExperimentContext } from '../types';
import { type ChaosMeshCRD } from './chaos-mesh-translate';
export declare class ChaosMeshAdapter implements ChaosOrchestrationAdapter {
    private readonly kubeconfigPath;
    private readonly namespace;
    constructor(kubeconfigPath: string, namespace: string);
    /** Live impl: K8s API watch on the named CRD; maps .spec.action
     *  (delay, abort, kill, partition, stress, etc.) → ExpectedFailurePattern.kind;
     *  .spec.duration (Go duration string, e.g. "60s") → recovery_seconds.
     *  v1 stub: the K8s-API client call stays unimplemented (integrator
     *  wires @kubernetes/client-node or equivalent). The translation
     *  logic is testable via translateChaosMeshSpec() exported from
     *  ./chaos-mesh-translate. */
    fetchExpectedFailurePattern(_experiment_ref: string): Promise<ExpectedFailurePattern>;
    /** Q29 SLICE 2 (proof-of-life) — translate an already-fetched CRD
     *  object to ExpectedFailurePattern. Useful for offline fixtures
     *  and tests; integrators wiring a real K8s client can compose
     *  `await k8sApi.get(...)` → `translateFromCRD(...)`. */
    translateFromCRD(crd: ChaosMeshCRD, nowUnixSeconds: number): ExpectedFailurePattern;
    fetchChaosExperimentContext(_experiment_ref: string): Promise<ChaosExperimentContext>;
    fetchDeployContext(_deploy: unknown): Promise<unknown>;
    emitVerdict(_verdict: unknown, _deploy: unknown): Promise<unknown>;
}
//# sourceMappingURL=chaos-mesh.d.ts.map
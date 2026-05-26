import type { ChaosOrchestrationAdapter, ExpectedFailurePattern, ChaosExperimentContext } from '../types';
export declare class LitmusChaosAdapter implements ChaosOrchestrationAdapter {
    private readonly kubeconfigPath;
    private readonly namespace;
    constructor(kubeconfigPath: string, namespace: string);
    /** Live impl: K8s API GET on the named ChaosEngine; for each
     *  spec.experiments[i].name, GET the corresponding ChaosExperiment CR
     *  and translate its env to ExpectedFailurePattern. */
    fetchExpectedFailurePattern(_experiment_ref: string): Promise<ExpectedFailurePattern>;
    fetchChaosExperimentContext(_experiment_ref: string): Promise<ChaosExperimentContext>;
    fetchDeployContext(_deploy: unknown): Promise<unknown>;
    emitVerdict(_verdict: unknown, _deploy: unknown): Promise<unknown>;
}
//# sourceMappingURL=litmus.d.ts.map
import type { ChaosOrchestrationAdapter, ExpectedFailurePattern, ChaosExperimentContext } from '../types';
export declare class GremlinChaosAdapter implements ChaosOrchestrationAdapter {
    private readonly apiToken;
    private readonly teamId;
    constructor(apiToken: string, teamId: string);
    /** Reads Gremlin's attack definition at /v1/attacks/{experiment_ref};
     *  maps attack-type taxonomy (latency, blackhole, cpu, …) onto
     *  ExpectedFailurePattern.kind; attack.length → recovery_seconds. */
    fetchExpectedFailurePattern(_experiment_ref: string): Promise<ExpectedFailurePattern>;
    fetchChaosExperimentContext(_experiment_ref: string): Promise<ChaosExperimentContext>;
    fetchDeployContext(_deploy: unknown): Promise<unknown>;
    /** Live impl: POST to Gremlin's experiment-result endpoint translating
     *  engine verdict → ChaosVerdict via translateToChaosVerdict() from ./types. */
    emitVerdict(_verdict: unknown, _deploy: unknown): Promise<unknown>;
}
//# sourceMappingURL=gremlin.d.ts.map
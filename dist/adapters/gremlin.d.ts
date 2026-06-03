import type { ChaosOrchestrationAdapter, ExpectedFailurePattern, ChaosExperimentContext } from '../types';
/** The slice of the global `fetch` signature the adapter depends on.
 *  Tests inject a fake returning a canned attack JSON; production passes
 *  `globalThis.fetch` (Node 20+ ships it built in — no new dependency). */
export type FetchLike = (url: string, init?: {
    headers?: Record<string, string>;
}) => Promise<{
    ok: boolean;
    status: number;
    json: () => Promise<unknown>;
}>;
export declare class GremlinChaosAdapter implements ChaosOrchestrationAdapter {
    private readonly apiToken;
    private readonly teamId;
    private readonly fetchClient;
    constructor(apiToken: string, teamId: string, fetchClient?: FetchLike);
    /** Reads Gremlin's attack definition at /v1/attacks/{experiment_ref};
     *  maps attack-type taxonomy (latency, blackhole, cpu, …) onto
     *  ExpectedFailurePattern.kind; attack.length → recovery_seconds.
     *  Composes the injected fetch client with the pure translator. */
    fetchExpectedFailurePattern(experiment_ref: string): Promise<ExpectedFailurePattern>;
    /** Fetch + translate into the experiment-start context the orchestrator
     *  consumes. Reuses the same attack pull as fetchExpectedFailurePattern. */
    fetchChaosExperimentContext(experiment_ref: string): Promise<ChaosExperimentContext>;
    /** GET /v1/attacks/{ref} via the injected client; throws on non-2xx.
     *  Gremlin authenticates with a team-scoped API token. */
    private getAttack;
    fetchDeployContext(_deploy: unknown): Promise<unknown>;
    /** Live impl: POST to Gremlin's experiment-result endpoint translating
     *  engine verdict → ChaosVerdict via translateToChaosVerdict() from ./types. */
    emitVerdict(_verdict: unknown, _deploy: unknown): Promise<unknown>;
}
//# sourceMappingURL=gremlin.d.ts.map
import type { ChaosOrchestrationAdapter, ExpectedFailurePattern, ChaosExperimentContext } from '../types';
export declare class AwsFisChaosAdapter implements ChaosOrchestrationAdapter {
    private readonly region;
    private readonly roleArn;
    constructor(region: string, roleArn: string);
    /** Live impl: FIS GetExperimentTemplate { templateId } + GetExperiment
     *  { id }; maps actions[].actionId to ExpectedFailurePattern.kind;
     *  stopConditions[].source resolution determines recovery_seconds bound. */
    fetchExpectedFailurePattern(_experiment_ref: string): Promise<ExpectedFailurePattern>;
    fetchChaosExperimentContext(_experiment_ref: string): Promise<ChaosExperimentContext>;
    fetchDeployContext(_deploy: unknown): Promise<unknown>;
    emitVerdict(_verdict: unknown, _deploy: unknown): Promise<unknown>;
}
//# sourceMappingURL=aws-fis.d.ts.map
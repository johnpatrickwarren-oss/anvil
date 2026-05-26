"use strict";
// engine/o0/anvil/aws-fis.ts — AWS Fault Injection Simulator adapter.
//
// AWS FIS: managed chaos service. Experiments described by experiment
// templates referenced by Amazon Resource Name (ARN). The adapter reads
// the template via the FIS API (GetExperimentTemplate / GetExperiment)
// and translates actions (aws:ec2:stop-instances, aws:rds:reboot-db-instance,
// aws:ssm:send-command, etc.) onto ExpectedFailurePattern.kind.
//
// v1 stub.
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsFisChaosAdapter = void 0;
class AwsFisChaosAdapter {
    constructor(region, roleArn) {
        this.region = region;
        this.roleArn = roleArn;
    }
    /** Live impl: FIS GetExperimentTemplate { templateId } + GetExperiment
     *  { id }; maps actions[].actionId to ExpectedFailurePattern.kind;
     *  stopConditions[].source resolution determines recovery_seconds bound. */
    async fetchExpectedFailurePattern(_experiment_ref) {
        throw new Error('AwsFisChaosAdapter.fetchExpectedFailurePattern not yet implemented (v1 stub per Q29)');
    }
    async fetchChaosExperimentContext(_experiment_ref) {
        throw new Error('AwsFisChaosAdapter.fetchChaosExperimentContext not yet implemented (v1 stub per Q29)');
    }
    async fetchDeployContext(_deploy) {
        throw new Error('AwsFisChaosAdapter.fetchDeployContext not yet implemented (v1 stub per Q29)');
    }
    async emitVerdict(_verdict, _deploy) {
        throw new Error('AwsFisChaosAdapter.emitVerdict not yet implemented (v1 stub per Q29)');
    }
}
exports.AwsFisChaosAdapter = AwsFisChaosAdapter;
//# sourceMappingURL=aws-fis.js.map
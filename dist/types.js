"use strict";
// engine/o0/anvil/types.ts — Anvil chaos-verdict typed contracts.
//
// Anvil packages the DeploySignal verdict substrate as a chaos-
// engineering-verdict product (Addition #29 / PRD-29 / Q29). The types
// here are the adapter-boundary contract: every chaos-platform adapter
// under engine/o0/anvil/ produces these shapes, and the orchestrator
// consumes ExpectedFailurePattern via OrchestrateParams.expectedFailurePattern.
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateToChaosVerdict = translateToChaosVerdict;
exports.tickWithinFaultWindow = tickWithinFaultWindow;
/** Translation table — engine verdict → chaos verdict — applied at the
 *  adapter boundary only. Keep in sync with engine/verdict.ts native
 *  verdict set. The `firing_family_in_suppress_set` argument does NOT
 *  change the verdict label; it rides on the audit-record annotation
 *  so post-mortem review can distinguish "expected fault produced
 *  expected signal" from "unexpected blast on a non-suppressed family." */
function translateToChaosVerdict(engine_verdict, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_firing_family_in_suppress_set) {
    switch (engine_verdict) {
        case 'proceed': return 'experiment_passed';
        case 'extend': return 'experiment_still_running';
        case 'suppressed_insufficient_samples': return 'experiment_inconclusive';
        case 'rollback': return 'experiment_failed_unexpectedly';
    }
}
/** Helper — is the supplied tick-time within the fault window declared
 *  by the pattern? Used by the orchestrator suppression check. */
function tickWithinFaultWindow(pattern, now_unix_seconds) {
    const start = pattern.fault_start_unix;
    const end = start + pattern.recovery_seconds;
    return now_unix_seconds >= start && now_unix_seconds <= end;
}
//# sourceMappingURL=types.js.map
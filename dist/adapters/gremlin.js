"use strict";
// engine/o0/anvil/gremlin.ts — Gremlin chaos-platform adapter.
//
// Gremlin: hosted SaaS chaos-engineering platform. Experiment definitions
// expose a REST API (api.gremlin.com/v1/attacks/{id}). The adapter pulls
// the attack-config (target, magnitude, length) and translates into
// ExpectedFailurePattern via the canonical shape in ./types.
//
// v1 stub: typed contract + provenance docstring; live HTTP implementation
// is deferred per PRD-29 priority ("typed stub bodies + provenance
// docstrings" — the wedge is the contract surface, not the network call).
Object.defineProperty(exports, "__esModule", { value: true });
exports.GremlinChaosAdapter = void 0;
class GremlinChaosAdapter {
    constructor(apiToken, teamId) {
        this.apiToken = apiToken;
        this.teamId = teamId;
    }
    /** Reads Gremlin's attack definition at /v1/attacks/{experiment_ref};
     *  maps attack-type taxonomy (latency, blackhole, cpu, …) onto
     *  ExpectedFailurePattern.kind; attack.length → recovery_seconds. */
    async fetchExpectedFailurePattern(_experiment_ref) {
        throw new Error('GremlinChaosAdapter.fetchExpectedFailurePattern not yet implemented (v1 stub per Q29)');
    }
    async fetchChaosExperimentContext(_experiment_ref) {
        throw new Error('GremlinChaosAdapter.fetchChaosExperimentContext not yet implemented (v1 stub per Q29)');
    }
    async fetchDeployContext(_deploy) {
        throw new Error('GremlinChaosAdapter.fetchDeployContext not yet implemented (v1 stub per Q29)');
    }
    /** Live impl: POST to Gremlin's experiment-result endpoint translating
     *  engine verdict → ChaosVerdict via translateToChaosVerdict() from ./types. */
    async emitVerdict(_verdict, _deploy) {
        throw new Error('GremlinChaosAdapter.emitVerdict not yet implemented (v1 stub per Q29)');
    }
}
exports.GremlinChaosAdapter = GremlinChaosAdapter;
//# sourceMappingURL=gremlin.js.map
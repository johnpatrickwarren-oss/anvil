"use strict";
// engine/o0/anvil/gremlin.ts — Gremlin chaos-platform adapter.
//
// Gremlin: hosted SaaS chaos-engineering platform. Experiment definitions
// expose a REST API (api.gremlin.com/v1/attacks/{id}). The adapter pulls
// the attack-config (type, magnitude, length) and translates into
// ExpectedFailurePattern via the pure translator in ./gremlin-translate.
//
// The HTTP call is split from the translation (mirrors the Chaos Mesh
// adapter): fetchExpectedFailurePattern composes an injectable fetch
// client with translateGremlinAttack, keeping the network boundary thin
// and the translation logic unit-testable without a live Gremlin account.
Object.defineProperty(exports, "__esModule", { value: true });
exports.GremlinChaosAdapter = void 0;
const gremlin_translate_1 = require("./gremlin-translate");
const GREMLIN_API_BASE = 'https://api.gremlin.com/v1';
class GremlinChaosAdapter {
    constructor(apiToken, teamId, 
    // Injectable for tests; defaults to the platform fetch.
    fetchClient = globalThis.fetch) {
        this.apiToken = apiToken;
        this.teamId = teamId;
        this.fetchClient = fetchClient;
    }
    /** Reads Gremlin's attack definition at /v1/attacks/{experiment_ref};
     *  maps attack-type taxonomy (latency, blackhole, cpu, …) onto
     *  ExpectedFailurePattern.kind; attack.length → recovery_seconds.
     *  Composes the injected fetch client with the pure translator. */
    async fetchExpectedFailurePattern(experiment_ref) {
        const attack = await this.getAttack(experiment_ref);
        return (0, gremlin_translate_1.translateGremlinAttack)(attack, Date.now() / 1000);
    }
    /** Fetch + translate into the experiment-start context the orchestrator
     *  consumes. Reuses the same attack pull as fetchExpectedFailurePattern. */
    async fetchChaosExperimentContext(experiment_ref) {
        const attack = await this.getAttack(experiment_ref);
        return {
            experiment_id: attack.guid ?? experiment_ref,
            experiment_ref,
            platform: 'gremlin',
            expected_failure_pattern: (0, gremlin_translate_1.translateGremlinAttack)(attack, Date.now() / 1000),
        };
    }
    /** GET /v1/attacks/{ref} via the injected client; throws on non-2xx.
     *  Gremlin authenticates with a team-scoped API token. */
    async getAttack(experiment_ref) {
        const res = await this.fetchClient(`${GREMLIN_API_BASE}/attacks/${experiment_ref}`, {
            headers: {
                Authorization: `Key ${this.apiToken}`,
                'X-Gremlin-Team-Id': this.teamId,
            },
        });
        if (!res.ok) {
            throw new Error(`Gremlin API GET /attacks/${experiment_ref} failed: ${res.status}`);
        }
        return (await res.json());
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
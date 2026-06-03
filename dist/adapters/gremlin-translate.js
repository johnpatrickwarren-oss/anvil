"use strict";
// engine/o0/anvil/gremlin-translate.ts — Q29 Gremlin adapter (translation).
//
// Pure translation from a Gremlin attack definition (the JSON shape that
// `GET https://api.gremlin.com/v1/attacks/{id}` returns) to the canonical
// ExpectedFailurePattern. Split out from gremlin.ts so the translation is
// testable independently of the HTTP client — mirrors the Chaos Mesh split
// (chaos-mesh-translate.ts ↔ chaos-mesh.ts).
//
// The HTTP client itself (fetching the attack via the Gremlin REST API)
// lives in gremlin.ts with an injectable fetch client; this module is
// network-free and deterministic.
//
// Reference: https://www.gremlin.com/docs/api-reference
// Attack-type taxonomy supported here: latency, blackhole, packet_loss
// (network-ish), cpu, memory (resource stress), shutdown, process_killer
// (pod-ish), time_travel (clock skew). Other types fall through to a
// generic `gremlin_<type>` translation; integrators may extend.
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyGremlinAttack = classifyGremlinAttack;
exports.translateGremlinAttack = translateGremlinAttack;
/** Map a Gremlin attack type onto its DS classification. Table-driven
 *  (rather than a branchy switch) so the function stays well under the
 *  no-god-functions complexity ceiling as the taxonomy grows. Keyed by
 *  the literal Gremlin `type` string; the `network_*`/`*_stress`/`pod_*`
 *  kind names mirror the Chaos Mesh classifier's vocabulary so verdicts
 *  read the same regardless of source platform. */
const GREMLIN_ATTACK_TAXONOMY = {
    // Network-ish: latency / blackhole / packet-loss → expect p99_latency
    // or downstream_err to shift; Family A is the targeted suppression.
    latency: {
        kind: 'network_latency',
        affected_signals: ['p99_latency', 'downstream_err'],
        suppress_families: ['A'],
    },
    blackhole: {
        kind: 'network_blackhole',
        affected_signals: ['p99_latency', 'downstream_err'],
        suppress_families: ['A'],
    },
    packet_loss: {
        kind: 'network_packet_loss',
        affected_signals: ['p99_latency', 'downstream_err'],
        suppress_families: ['A'],
    },
    // Resource stress: cpu / memory → expect p99_latency, cost_req to shift.
    cpu: {
        kind: 'cpu_stress',
        affected_signals: ['p99_latency', 'cost_req'],
        suppress_families: ['A'],
    },
    memory: {
        kind: 'memory_stress',
        affected_signals: ['p99_latency', 'cost_req'],
        suppress_families: ['A'],
    },
    // Pod-ish: shutdown / process-killer → expect downstream_err, p99_latency.
    shutdown: {
        kind: 'pod_shutdown',
        affected_signals: ['downstream_err', 'p99_latency'],
        suppress_families: ['A'],
    },
    process_killer: {
        kind: 'pod_process_killer',
        affected_signals: ['downstream_err', 'p99_latency'],
        suppress_families: ['A'],
    },
    // Clock skew: time_travel can cascade unpredictably. Suppress nothing
    // by default; let everything fire and let the operator interpret.
    time_travel: {
        kind: 'time_skew',
        affected_signals: [],
        suppress_families: [],
    },
};
/** Classify a Gremlin attack type → (kind, affected_signals,
 *  suppress_families). Unknown types fall through to a generic
 *  `gremlin_<type>` kind with no suppression (every fire is unexpected),
 *  mirroring the Chaos Mesh classifier's `chaos_<kind>` fallthrough. */
function classifyGremlinAttack(attackType) {
    return (GREMLIN_ATTACK_TAXONOMY[attackType] ?? {
        kind: `gremlin_${attackType}`,
        affected_signals: [],
        suppress_families: [],
    });
}
/** Translate a fetched Gremlin attack object into the canonical
 *  ExpectedFailurePattern that the orchestrator consumes via
 *  OrchestrateParams.expectedFailurePattern. `nowUnixSeconds` is the
 *  fault-start timestamp; pass `Date.now() / 1000` for live runs or a
 *  fixed value for replay determinism. Network-free — same discipline
 *  as translateChaosMeshSpec. */
function translateGremlinAttack(attack, nowUnixSeconds) {
    // Mirror the Chaos Mesh `missing spec.duration` invariant: Anvil
    // requires a bounded fault window. Gremlin carries length in seconds;
    // a missing or zero/negative length is rejected.
    if (!attack.length || attack.length <= 0) {
        throw new Error(`Gremlin attack ${attack.guid ?? '?'} (type ${attack.type}) ` +
            `missing/zero length; Anvil requires a bounded fault window`);
    }
    const { kind, affected_signals, suppress_families } = classifyGremlinAttack(attack.type);
    return {
        kind,
        affected_signals,
        // Magnitude is operator-keyed; Gremlin's payload may carry a numeric
        // magnitude (e.g. ms of latency, % CPU), but it is action-scaled, not
        // a perturbation-sigma target. v1 default is 1σ — operator overrides
        // via the adapter's magnitude argument if a tighter expectation holds.
        magnitude: 1.0,
        magnitude_unit: 'sigma',
        recovery_seconds: attack.length,
        suppress_families,
        fault_start_unix: nowUnixSeconds,
    };
}
//# sourceMappingURL=gremlin-translate.js.map
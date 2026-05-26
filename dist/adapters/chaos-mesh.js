"use strict";
// engine/o0/anvil/chaos-mesh.ts — Chaos Mesh (CNCF) adapter.
//
// Chaos Mesh: Kubernetes-native chaos engineering. Experiments are CRDs
// (PodChaos, NetworkChaos, IOChaos, StressChaos, TimeChaos, …) read via
// the K8s API. The adapter watches the experiment CRD in the target
// namespace and reads .spec.action + .spec.duration for the attack
// class and fault-window length.
//
// v1 stub.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChaosMeshAdapter = void 0;
const chaos_mesh_translate_1 = require("./chaos-mesh-translate");
class ChaosMeshAdapter {
    constructor(kubeconfigPath, namespace) {
        this.kubeconfigPath = kubeconfigPath;
        this.namespace = namespace;
    }
    /** Live impl: K8s API watch on the named CRD; maps .spec.action
     *  (delay, abort, kill, partition, stress, etc.) → ExpectedFailurePattern.kind;
     *  .spec.duration (Go duration string, e.g. "60s") → recovery_seconds.
     *  v1 stub: the K8s-API client call stays unimplemented (integrator
     *  wires @kubernetes/client-node or equivalent). The translation
     *  logic is testable via translateChaosMeshSpec() exported from
     *  ./chaos-mesh-translate. */
    async fetchExpectedFailurePattern(_experiment_ref) {
        throw new Error('ChaosMeshAdapter.fetchExpectedFailurePattern not yet implemented (v1 stub per Q29); use translateChaosMeshSpec for offline-fixture translation');
    }
    /** Q29 SLICE 2 (proof-of-life) — translate an already-fetched CRD
     *  object to ExpectedFailurePattern. Useful for offline fixtures
     *  and tests; integrators wiring a real K8s client can compose
     *  `await k8sApi.get(...)` → `translateFromCRD(...)`. */
    translateFromCRD(crd, nowUnixSeconds) {
        return (0, chaos_mesh_translate_1.translateChaosMeshSpec)(crd, nowUnixSeconds);
    }
    async fetchChaosExperimentContext(_experiment_ref) {
        throw new Error('ChaosMeshAdapter.fetchChaosExperimentContext not yet implemented (v1 stub per Q29)');
    }
    async fetchDeployContext(_deploy) {
        throw new Error('ChaosMeshAdapter.fetchDeployContext not yet implemented (v1 stub per Q29)');
    }
    async emitVerdict(_verdict, _deploy) {
        throw new Error('ChaosMeshAdapter.emitVerdict not yet implemented (v1 stub per Q29)');
    }
}
exports.ChaosMeshAdapter = ChaosMeshAdapter;
//# sourceMappingURL=chaos-mesh.js.map
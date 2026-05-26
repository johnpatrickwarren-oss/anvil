# Anvil

**Chaos-engineering verdict layer on the DeploySignal substrate.** When a chaos-engineering practitioner injects a fault, Anvil renders the pass/fail call — *statistically, not by eyeballing dashboards*.

The chaos workflow is structurally a deploy gate run backward. Instead of "deploy and decide whether to roll back," the operator runs "inject fault and decide whether the system passed." [DeploySignal](https://github.com/johnpatrickwarren-oss/deploysignal) already owns the verdict surface for the forward direction (Ville-bounded multi-family detector portfolio + audit substrate). Anvil packages that substrate for the inverse problem.

## What Anvil is

- **An `ExpectedFailurePattern` contract.** The operator declares at experiment-start what failure shape they expect: which signals will be affected, by what magnitude, with what recovery window, and which detector families to suppress for the duration of the declared fault.
- **Four chaos-platform adapter stubs.** [Gremlin](https://www.gremlin.com/), [Chaos Mesh](https://chaos-mesh.org/), [AWS FIS](https://aws.amazon.com/fis/), [LitmusChaos](https://litmuschaos.io/). Typed contracts + provenance docstrings; network-call implementations are integrator-supplied at v1. The Chaos Mesh CRD translation is real and tested (12 cases under `test/q29-chaos-mesh-translation.test.ts`).
- **An expected-fault family suppression hook.** Pure post-`evaluateHealth` rewrite. When the current tick lies within the declared fault window `[fault_start_unix, +recovery_seconds]`, the named families flip to `verdict: 'suppressed'` with `reason_code: 'expected_failure_pattern'`. Gated on `expectedFailurePattern !== undefined` → pre-Anvil orchestrator path is byte-identical.
- **A reference profile** (`profiles/anvil-chaos-experiment.yaml`). Family A + C + D + E enabled with honest per-family calibration provenance; Family B disabled pending chaos-structural signature work.
- **A verdict vocabulary translation.** At the adapter boundary, the engine's native `proceed | extend | rollback | suppressed_insufficient_samples` becomes `experiment_passed | experiment_still_running | experiment_failed_unexpectedly | experiment_inconclusive`.

## Empirical position

What's defensible at v0.1.0-pre (the position chaos-engineering buyers should hear):

- **Math validated.** Ville bound rigorously verified on iid Gaussian H₀ (Family A betting-e-process: ≤1/131 fires at α = 3.33e-5 across 131 + 1000 trajectory tests). Conformal coverage E[e_t|H₀] = 1 exactly (Family E). Spectral fire-horizon gates at 1σ₀/2σ₀/3σ₀ (Family D).
- **Validated on 5 real LLM-inference workload substrates.** Q66 close-out sweep: **94% FPR pass** (34 of 36 cells) on real_burstgpt + real_azure_llm_inference + real_mooncake + real_huggingface_lmsys_arena × `iid_bootstrap` mode under the per-mode acceptance gate (α × 1.2).
- **Validated against 5 real-world incident regression profiles.** Best report-card: **4/5 detection within Ville-bound α discipline + 4/4 attribution accuracy** when detected (Anthropic XLA precision drift, Cloudflare KV degradation, GitHub availability latency regression, OpenAI routing error ramp; Anthropic TPU output corruption is the residual miss).
- **NAB cross-domain transfer: 17.14 aggregate per family** with per-dataset probationary calibration. Below the architect-aspirational ≥50/≥40 gates. The residual gap is within-dataset autocorrelation (φ ≈ 0.95 on real NAB datasets); architectural remediation is Q70 SLICE 2 (self-normalized e-process fallback wired into page-cusum + conformal dispatch), shipped as engine SLICE 1 library primitive at `dist/detectors/self-normalized-e-process-fallback.js` but not yet wired into the detector dispatch path.

## The bundle

```
DS engine + Anvil adapter family + (optional) Tessera per-shard observation
```

- **`@johnpatrickwarren-oss/deploysignal-engine`** — Detector math (Family A/B/C/D/E), Ville-bounded e-processes, hierarchical pooling, topology BFS, e-BH FDR. Anvil consumes it as an npm dependency.
- **`@johnpatrickwarren-oss/anvil`** (this repo) — Chaos-verdict packaging. Contract types + four adapter stubs + suppression hook + reference profile + Chaos Mesh translation.
- **`@johnpatrickwarren-oss/tessera`** (optional, for shard-targeted chaos) — Per-shard observation layer. Composes cleanly with Anvil for chaos experiments targeting specific shards (pod-kill on shard-04; network-partition on rack-2).

## Use

```ts
import {
  ChaosMeshAdapter,
  type ExpectedFailurePattern,
  translateChaosMeshSpec,
  applyExpectedFailurePatternSuppression,
  tickWithinFaultWindow,
} from '@johnpatrickwarren-oss/anvil';

// 1. Translate a Chaos Mesh CRD into the canonical ExpectedFailurePattern shape.
const pattern: ExpectedFailurePattern = translateChaosMeshSpec(networkChaosCRD, Date.now() / 1000);

// 2. Wire the suppression hook into your orchestrator (consumes engine HealthResult).
const suppressed = applyExpectedFailurePatternSuppression(healthResult, pattern, nowUnixSeconds);

// 3. Adapter network calls (fetchDeployContext, emitVerdict) are integrator-
//    supplied at v1 — wire @kubernetes/client-node or your platform SDK.
const adapter = new ChaosMeshAdapter(kubeconfigPath, namespace);
```

## Verdict vocabulary mapping (Q29.2 architect-pick: adapter-boundary)

| Engine native | Chaos verdict |
|---|---|
| `proceed` | `experiment_passed` |
| `rollback` | `experiment_failed_unexpectedly` (audit annotation `firing_family_in_suppress_set: bool` distinguishes expected-fault firing from unexpected-blast firing) |
| `extend` | `experiment_still_running` |
| `suppressed_insufficient_samples` | `experiment_inconclusive` |

## Status

- v0.1.0-pre — initial extraction from in-tree DeploySignal Addition #29. Consumes `deploysignal-engine` v0.2.0-pre.
- The four adapter `fetch*` / `emitVerdict` methods throw `not yet implemented (v1 stub)`. The Chaos Mesh CRD translation is real and tested. Wiring the K8s API client / Gremlin REST / AWS FIS SDK / Litmus CRDs to the live platforms is the integrator's slice.

## See also

- `coordination/PRD-29-anvil.md` — Product requirements with user stories + functional/non-functional requirements + acceptance criteria + anti-scope.
- `coordination/Q29-ANVIL-CHAOS-VERDICT-SPEC.md` — Architect implementation spec (Q29.1/Q29.2/Q29.3 dispositions, P3 ten-axis verification).
- `demos/ANVIL-DEMO.md` — 12-tick walkthrough (Chaos Mesh `NetworkChaos(delay)` against a generic microservice) showing the suppression annotation visible on Family A inside the declared fault window.
- [DeploySignal](https://github.com/johnpatrickwarren-oss/deploysignal) — forward-direction canary verdict product on the same substrate.
- [Tessera](https://github.com/johnpatrickwarren-oss/tessera) — sibling per-shard observation product.
- [Cairn](https://github.com/johnpatrickwarren-oss/cairn) — sibling postmortem-attribution product.

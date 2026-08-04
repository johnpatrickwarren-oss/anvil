# Anvil

**Chaos-engineering verdict layer on the DeploySignal substrate.** When a chaos-engineering practitioner injects a fault, Anvil renders the pass/fail call — *statistically, not by eyeballing dashboards*.

The chaos workflow is structurally a deploy gate run backward. Instead of "deploy and decide whether to roll back," the operator runs "inject fault and decide whether the system passed." [DeploySignal](https://github.com/johnpatrickwarren-oss/deploysignal) already owns the verdict surface for the forward direction (Ville-bounded multi-family detector portfolio + audit substrate). Anvil packages that substrate for the inverse problem.

## What Anvil is

- **An `ExpectedFailurePattern` contract.** The operator declares at experiment-start what failure shape they expect: which signals will be affected, by what magnitude, with what recovery window, and which detector families to suppress for the duration of the declared fault.
- **Four chaos-platform adapters (two with real, tested translations).** [Gremlin](https://www.gremlin.com/), [Chaos Mesh](https://chaos-mesh.org/), [AWS FIS](https://aws.amazon.com/fis/), [LitmusChaos](https://litmuschaos.io/). Typed contracts + provenance docstrings; live network wiring is integrator-supplied at v1. The Chaos Mesh CRD translation is real and tested (12 cases, `test/q29-chaos-mesh-translation.test.ts`), and Gremlin's attack translation + `fetchExpectedFailurePattern` / `fetchChaosExperimentContext` are implemented against an injectable fetch (14 cases, `test/q29-gremlin-translation.test.ts`).
- **An expected-fault family suppression hook.** Pure post-`evaluateHealth` rewrite. When the current tick lies within the declared fault window `[fault_start_unix, +recovery_seconds]`, the named families flip to `verdict: 'suppressed'` with `reason_code: 'expected_failure_pattern'`. Gated on `expectedFailurePattern !== undefined` → pre-Anvil orchestrator path is byte-identical.
- **A reference profile** (`profiles/anvil-chaos-experiment.yaml`). Family A + C + D + E enabled with honest per-family calibration provenance; Family B disabled pending chaos-structural signature work.
- **A verdict vocabulary translation.** At the adapter boundary, the engine's native `proceed | extend | rollback | suppressed_insufficient_samples` becomes `experiment_passed | experiment_still_running | experiment_failed_unexpectedly | experiment_inconclusive`.

## Empirical position — withdrawn

This section used to carry a block of detector numbers. Anvil ships no detector and has run no
benchmark of its own. The numbers were copied in from `deploysignal-engine` and from DeploySignal,
and four of them were wrong at the version Anvil pins. Each is named below with what was wrong.

**What Anvil's 45 tests cover.** All of them are unit-level and none are statistical: 12 Chaos Mesh
CRD translation cases, 14 Gremlin cases (attack translation plus the two `fetch*` methods against an
injectable fetch), 7 contract-type cases, 6 suppression-rewrite cases, 6 profile-YAML validation
cases. They establish that the translation and suppression code does what the types say. They
establish nothing about detector behaviour.

### Withdrawn

**"NAB cross-domain transfer: 17.14 aggregate per family."** Anvil ran no NAB benchmark. There is no
validation directory and no benchmark artifact in any commit of this repo. The number is also the
arithmetic signature of a detector that never fires. In the engine's `tools/nab-scoring.ts`, a
dataset with zero annotation windows scores `100 + fp_count · fp_weight`, an annotated dataset clamps
to 0, and the family aggregate is an unweighted mean. Six of the 35 datasets in
`validation/nab/report-2026-07-17-default.json` have zero windows, so total silence scores
100 × 6/35 = 17.14. "Per family" is wrong on top of that. 17.14 was one detector,
`family_D_spectral`, at SLICE 4; the same row of the engine's CHANGELOG table gives
`family_A_betting` 0.00 and `family_A_page_cusum` 17.07.

**"The residual gap is within-dataset autocorrelation; architectural remediation is Q70 SLICE 2."**
Both halves were already settled inside the release Anvil pins. SLICE 5's AR(1) pre-whitening is what
moved spectral from 17.14 to 26.55, and SLICE 6 took it to 29.79. All of that shipped in v0.3.0-pre.
The named remediation was then retired in the same release: the SLICE 7 decision recorded at
`detectors/self-normalized-e-process-fallback.ts` finds the §7 LIL bound is for empirical-CDF and
quantile work rather than mean-shift detection, and that applying it as a self-normalized t-statistic
threshold produces a ~100% false-positive rate on iid Gaussian H₀.

**"94% FPR pass (34 of 36 cells)" on 5 real LLM-inference workload substrates.** The figure appears
in no DeploySignal or engine artifact. It exists only here and in this repo's own profile comment,
and the sentence then named four substrates rather than five. I cannot trace it to a run.

**"Anthropic TPU output corruption is the residual miss."** DeploySignal's `CHEAT-SHEET.md` records
the post-P1 report card as 4/5 with `openai_routing_error_ramp` as the miss. This section named the
detected profile as missed and the missed profile as detected.

### Restated with their scope

**The Ville-bound test is real, and its baseline is not estimated.** DeploySignal's
`test/v1-h3-ville-bound-iid-gaussian.test.ts` holds at ≤1 fire in 131 trajectories at α = 3.33e-5,
and again over 1000. It supplies the true baseline as literals: `baselineMean = 100`, `sigma2 = 4`.
The engine's validity-envelope layer, added at v0.4.0-pre and so after Anvil's pin, records the same
detector as `validUnderEstimatedBaseline: false`. That test exists because the FPR sweep saw 47 fires
in 131 resampled healthy windows (35.9%), where the baseline was estimated. On a chaos workload the
baseline is estimated.

**`E[e_t|H₀] = 1` exactly holds for one conformal variant.** It is the `weighted_e_value` kind. The
compiler's default `auto` selector routes there only when the baseline calibration bundle spans at
least 7 days and expected ESS clears 0.9 × 20000; otherwise it falls back to `unweighted`, a
parametric-bootstrap p-value that carries no e-value guarantee. This repo's profile declares no
chaos-workload calibration history, so nothing here establishes which branch a chaos run takes.

**The Family D fire horizons are a synthetic power check.** DeploySignal's
`test/spectral-e-detector.test.ts` fires within 36 / 17 / 11 ticks at 1σ₀ / 2σ₀ / 3σ₀ against fixed
anchors μ₀ = 0.42, σ₀ = 0.05. That is a construction, not a measurement on a workload.

For current guarantees, read `deploysignal-engine` at the version you actually run. Anvil pins
`v0.6.6-pre` (re-pinned 2026-08-03 from v0.3.0-pre), which includes the validity-envelope layer that
qualifies the Ville-bound claim above.

## The bundle

```
DS engine + Anvil adapter family + (optional) Tessera per-shard observation
```

- **`@johnpatrickwarren-oss/deploysignal-engine`** — Detector math (Family A/B/C/D/E), Ville-bounded e-processes, hierarchical pooling, topology BFS, e-BH FDR. Anvil depends on it for its *types* (the suppression hook and verdict translation are pure rewrites over engine outputs); no detector code executes inside Anvil — the engine runs wherever the orchestrator runs.
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
| `rollback` | `experiment_failed_unexpectedly` (the contract reserves a `firing_family_in_suppress_set: bool` audit annotation to distinguish expected-fault firing from unexpected-blast firing; the translator deliberately does not let it change the verdict, and nothing emits it yet — see `types.ts`) |
| `extend` | `experiment_still_running` |
| `suppressed_insufficient_samples` | `experiment_inconclusive` |

## Status

- **Dormant since 2026-07-02.** Pinned to `deploysignal-engine` v0.3.0-pre, 10 releases behind current. Consumption is types-only (`types/policy`, `types/verdict`), and both of those interfaces are byte-identical between v0.3.0-pre and the engine's current main. No engine code executes in this repo.
- v0.1.0-pre — initial extraction from in-tree DeploySignal Addition #29. Consumes `deploysignal-engine` at the tag pinned in `package.json` (prose copies of the pin have gone stale before — package.json is the source of truth).
- **Two Anvils exist:** this standalone repo (the extraction) and the original in-tree packaging at DeploySignal's `engine/o0/anvil/` (Addition #29), which some sibling docs still describe as the only one. This repo is the standalone continuation; the in-tree copy is the historical origin.
- Gremlin implements its two `fetch*` methods against an injectable fetch (tested); the remaining adapters' `fetch*` methods and all `fetchDeployContext` / `emitVerdict` methods throw `not yet implemented (v1 stub)`. The Chaos Mesh CRD and Gremlin attack translations are real and tested. Wiring the K8s API client / Gremlin REST auth / AWS FIS SDK / Litmus CRDs to the live platforms is the integrator's slice.

## See also

- `demos/ANVIL-DEMO.md` — 12-tick walkthrough (Chaos Mesh `NetworkChaos(delay)` against a generic microservice) showing the suppression annotation visible on Family A inside the declared fault window.
- [DeploySignal](https://github.com/johnpatrickwarren-oss/deploysignal) — forward-direction canary verdict product on the same substrate.
- [Tessera](https://github.com/johnpatrickwarren-oss/tessera) — sibling per-shard observation product.
- [Cairn](https://github.com/johnpatrickwarren-oss/cairn) — sibling postmortem-attribution product.

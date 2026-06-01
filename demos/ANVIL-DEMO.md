# Anvil chaos-verdict walkthrough — DS-Anvil proof-of-life

_Companion to `tools/demo-anvil.js`. Run via `node tools/demo-anvil.js`._

This demo shows the Anvil (Addition #29) `expected_failure_pattern`
suppression mechanism end-to-end: an operator declares the expected fault
shape at chaos-experiment start; DeploySignal suppresses the named
detector family inside the declared fault window with the new
`reason_code: 'expected_failure_pattern'`; outside the window, detection
runs byte-identically to pre-Anvil (PRD-29 AC-11).

## The scenario

A 12-tick walkthrough modeling a Chaos Mesh `NetworkChaos(delay)`
experiment against a generic microservice. Tick interval: 30 seconds.
Total simulated wallclock: 6 minutes.

| Range | Phase | What the operator simulates |
|---|---|---|
| Tick 0–3 | Pre-window | Baseline behavior; no fault injected. |
| Tick 4–8 | **Fault window** | Network delay injected. p99_latency spikes to 280ms (≈50% over baseline); downstream_err climbs to 0.17. `expected_failure_pattern` is in effect with `suppress_families=['A']`. |
| Tick 9–11 | Post-recovery | Fault released; metrics back to baseline. The suppression hook releases because `tick_unix > fault_start_unix + recovery_seconds`. |

## The expected_failure_pattern

```js
{
  kind: 'network_delay',
  affected_signals: ['p99_latency', 'downstream_err'],
  magnitude: 1.0,
  magnitude_unit: 'sigma',
  recovery_seconds: 150,            // 5 ticks × 30s = the declared fault duration
  suppress_families: ['A'],         // Family A is the per-signal mean-shift detector;
                                    // an injected latency fault is exactly what it would
                                    // fire on. Suppressing it lets the experiment run
                                    // without false-alarm verdicts on the very signal
                                    // the operator is deliberately perturbing.
  fault_start_unix: 1_700_000_120,  // T0 + 4 ticks × 30s
}
```

## What to look for in the output

The ASCII table's `fam A` column carries the proof-of-life:

- **Ticks 0–3 and 10–11 (outside the fault window):** Family A evaluates
  normally. If the calibrated config matches the baseline distribution,
  Family A returns `clean`; if the synthetic baseline diverges from the
  calibrated config, Family A may return `fire` — either way, this is the
  pre-Anvil path running byte-identically.
- **Ticks 4–9 (inside the fault window):** Family A returns
  `suppressed[expected_failure_pattern]`. This is the Anvil hook
  rewriting what would otherwise be a Family A fire on the injected
  latency spike, because the operator declared the fault expected.

The `fam C` column shows Family C (multivariate drift) running
unconditionally — Family C is the "unexpected blast" catcher. If the
injected latency causes downstream effects on signals the operator did
NOT expect (e.g., cost_req drifting alongside p99), Family C will fire
and the chaos verdict will surface as `experiment_failed_unexpectedly`
even though Family A is suppressed.

## The verdict vocabulary translation (Q29.2 architect-pick)

Engine native verdict → chaos verdict, applied at the adapter boundary
when `DeployContext.strategy === 'chaos_experiment'`:

| Engine | Chaos verdict |
|---|---|
| `proceed` | `experiment_passed` |
| `rollback` | `experiment_failed_unexpectedly` (audit annotation `firing_family_in_suppress_set: bool` distinguishes expected-fault firing from unexpected-blast firing) |
| `extend` / `baking` | `experiment_still_running` |
| `suppressed_insufficient_samples` | `experiment_inconclusive` |

## Replay artifact

The demo saves one `AuditRecord` per tick to
`demos/anvil-chaos-walkthrough.json`. The file is replay-clean: same
compiled config + same expected_failure_pattern + same metric stream →
byte-identical audit JSON. Re-running `node tools/demo-anvil.js` regenerates
it; `--check` mode exits non-zero if the file on disk is stale.

## Honest scope at v1 (PRD-29 priorities)

- The demo uses the existing `runs/compiled-configs/v4-fusion-novelty.json`
  which is calibrated against an LLM-inference baseline, not against the
  generic-microservice baseline this demo's metrics simulate. Some families
  will fire outside the fault window because of that calibration mismatch.
  That's not the demo subject — the demo subject is the suppression
  annotation visible on Family A inside the fault window.
- A dedicated `anvil-chaos-experiment` compiled config (with calibration
  matching the synthetic chaos baseline so the outside-window verdicts
  also come out clean) is follow-on per PRD-29 should-have.
- The four chaos-platform adapter `fetch*` methods still throw `not yet
  implemented (v1 stub)`. The Chaos Mesh `translateFromCRD` /
  `translateChaosMeshSpec` translation is real and tested (12 cases
  under `test/q29-chaos-mesh-translation.test.ts`); wiring it to a live
  `@kubernetes/client-node` is the next slice for a full proof-of-life
  against a real cluster.

## See also

- `NORTH-STAR-ARCHITECTURE.md` Addition #29 — contract block + bundle framing
- `engine/o0/anvil/` — typed contracts + four adapter stubs + suppression hook
- `profiles/anvil-chaos-experiment.yaml` — reference profile (extends generic-microservice)
- [Tessera](https://github.com/johnpatrickwarren-oss/tessera) — sibling product (per-shard observation layer of the DS-Anvil bundle)

// anvil/index.ts — public surface barrel.
//
// Anvil packages the DeploySignal verdict substrate as a chaos-
// engineering verdict layer. Consumers (chaos-engineering platforms;
// integrators wiring their own platform adapter) import:
//
//   - the canonical contract types (ExpectedFailurePattern,
//     ChaosOrchestrationAdapter, ChaosExperimentContext, ChaosVerdict)
//   - the engine-side suppression hook (applyExpectedFailurePatternSuppression)
//   - the verdict-vocabulary translation helper (translateToChaosVerdict)
//   - the four chaos-platform adapter stubs (Gremlin, Chaos Mesh, AWS
//     FIS, Litmus) — typed contracts; network-call implementations are
//     integrator-supplied at v1 (the Chaos Mesh translation is real and
//     tested independently of the K8s API client).
//
// Composes on top of @johnpatrickwarren-oss/deploysignal-engine —
// detector math (Family A/B/C/D/E), Ville-bounded e-processes, and the
// orchestration-adapter contract live in the engine package.

export type {
  SuppressibleFamily,
  ExpectedFailurePattern,
  ChaosExperimentContext,
  ChaosOrchestrationAdapter,
  ChaosVerdict,
  EngineNativeVerdict,
} from './types';

export {
  translateToChaosVerdict,
  tickWithinFaultWindow,
} from './types';

export { applyExpectedFailurePatternSuppression } from './suppression';

export { GremlinChaosAdapter } from './adapters/gremlin';
export { ChaosMeshAdapter } from './adapters/chaos-mesh';
export { AwsFisChaosAdapter } from './adapters/aws-fis';
export { LitmusChaosAdapter } from './adapters/litmus';
export {
  translateChaosMeshSpec,
  parseGoDurationSeconds,
} from './adapters/chaos-mesh-translate';
export type { ChaosMeshCRD } from './adapters/chaos-mesh-translate';

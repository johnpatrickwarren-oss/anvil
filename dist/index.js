"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGoDurationSeconds = exports.translateChaosMeshSpec = exports.LitmusChaosAdapter = exports.AwsFisChaosAdapter = exports.ChaosMeshAdapter = exports.GremlinChaosAdapter = exports.applyExpectedFailurePatternSuppression = exports.tickWithinFaultWindow = exports.translateToChaosVerdict = void 0;
var types_1 = require("./types");
Object.defineProperty(exports, "translateToChaosVerdict", { enumerable: true, get: function () { return types_1.translateToChaosVerdict; } });
Object.defineProperty(exports, "tickWithinFaultWindow", { enumerable: true, get: function () { return types_1.tickWithinFaultWindow; } });
var suppression_1 = require("./suppression");
Object.defineProperty(exports, "applyExpectedFailurePatternSuppression", { enumerable: true, get: function () { return suppression_1.applyExpectedFailurePatternSuppression; } });
var gremlin_1 = require("./adapters/gremlin");
Object.defineProperty(exports, "GremlinChaosAdapter", { enumerable: true, get: function () { return gremlin_1.GremlinChaosAdapter; } });
var chaos_mesh_1 = require("./adapters/chaos-mesh");
Object.defineProperty(exports, "ChaosMeshAdapter", { enumerable: true, get: function () { return chaos_mesh_1.ChaosMeshAdapter; } });
var aws_fis_1 = require("./adapters/aws-fis");
Object.defineProperty(exports, "AwsFisChaosAdapter", { enumerable: true, get: function () { return aws_fis_1.AwsFisChaosAdapter; } });
var litmus_1 = require("./adapters/litmus");
Object.defineProperty(exports, "LitmusChaosAdapter", { enumerable: true, get: function () { return litmus_1.LitmusChaosAdapter; } });
var chaos_mesh_translate_1 = require("./adapters/chaos-mesh-translate");
Object.defineProperty(exports, "translateChaosMeshSpec", { enumerable: true, get: function () { return chaos_mesh_translate_1.translateChaosMeshSpec; } });
Object.defineProperty(exports, "parseGoDurationSeconds", { enumerable: true, get: function () { return chaos_mesh_translate_1.parseGoDurationSeconds; } });
//# sourceMappingURL=index.js.map
import type { HealthResult } from '@johnpatrickwarren-oss/deploysignal-engine/types/policy';
import type { ExpectedFailurePattern } from './types';
/** Returns a HealthResult with families in `suppress_families` rewritten
 *  to suppressed when `nowUnixSeconds` lies within the declared fault
 *  window. Pure — does not mutate `hr`. */
export declare function applyExpectedFailurePatternSuppression(hr: HealthResult, pattern: ExpectedFailurePattern, nowUnixSeconds: number): HealthResult;
//# sourceMappingURL=suppression.d.ts.map
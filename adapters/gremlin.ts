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

import type {
  ChaosOrchestrationAdapter,
  ExpectedFailurePattern,
  ChaosExperimentContext,
} from '../types';
import {
  translateGremlinAttack,
  type GremlinAttack,
} from './gremlin-translate';

/** The slice of the global `fetch` signature the adapter depends on.
 *  Tests inject a fake returning a canned attack JSON; production passes
 *  `globalThis.fetch` (Node 20+ ships it built in — no new dependency). */
export type FetchLike = (
  url: string,
  init?: { headers?: Record<string, string> },
) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

const GREMLIN_API_BASE = 'https://api.gremlin.com/v1';

export class GremlinChaosAdapter implements ChaosOrchestrationAdapter {
  private readonly fetchClient: FetchLike;

  constructor(
    private readonly apiToken: string,
    private readonly teamId: string,
    // Injectable for tests; defaults to the platform fetch.
    fetchClient: FetchLike = globalThis.fetch as unknown as FetchLike,
  ) {
    this.fetchClient = fetchClient;
  }

  /** Reads Gremlin's attack definition at /v1/attacks/{experiment_ref};
   *  maps attack-type taxonomy (latency, blackhole, cpu, …) onto
   *  ExpectedFailurePattern.kind; attack.length → recovery_seconds.
   *  Composes the injected fetch client with the pure translator. */
  async fetchExpectedFailurePattern(experiment_ref: string): Promise<ExpectedFailurePattern> {
    const attack = await this.getAttack(experiment_ref);
    return translateGremlinAttack(attack, Date.now() / 1000);
  }

  /** Fetch + translate into the experiment-start context the orchestrator
   *  consumes. Reuses the same attack pull as fetchExpectedFailurePattern. */
  async fetchChaosExperimentContext(experiment_ref: string): Promise<ChaosExperimentContext> {
    const attack = await this.getAttack(experiment_ref);
    return {
      experiment_id: attack.guid ?? experiment_ref,
      experiment_ref,
      platform: 'gremlin',
      expected_failure_pattern: translateGremlinAttack(attack, Date.now() / 1000),
    };
  }

  /** GET /v1/attacks/{ref} via the injected client; throws on non-2xx.
   *  Gremlin authenticates with a team-scoped API token. */
  private async getAttack(experiment_ref: string): Promise<GremlinAttack> {
    const res = await this.fetchClient(
      `${GREMLIN_API_BASE}/attacks/${experiment_ref}`,
      {
        headers: {
          Authorization: `Key ${this.apiToken}`,
          'X-Gremlin-Team-Id': this.teamId,
        },
      },
    );
    if (!res.ok) {
      throw new Error(
        `Gremlin API GET /attacks/${experiment_ref} failed: ${res.status}`,
      );
    }
    return (await res.json()) as GremlinAttack;
  }

  async fetchDeployContext(_deploy: unknown): Promise<unknown> {
    throw new Error('GremlinChaosAdapter.fetchDeployContext not yet implemented (v1 stub per Q29)');
  }

  /** Live impl: POST to Gremlin's experiment-result endpoint translating
   *  engine verdict → ChaosVerdict via translateToChaosVerdict() from ./types. */
  async emitVerdict(_verdict: unknown, _deploy: unknown): Promise<unknown> {
    throw new Error('GremlinChaosAdapter.emitVerdict not yet implemented (v1 stub per Q29)');
  }
}

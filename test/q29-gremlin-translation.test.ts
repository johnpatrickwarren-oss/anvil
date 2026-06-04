// test/q29-gremlin-translation.test.ts — Q29 Gremlin adapter.
//
// Covers translateGremlinAttack + classifyGremlinAttack, plus a
// fetchExpectedFailurePattern test driven by an injected fake fetch
// client (no live Gremlin account needed). Mirrors the Chaos Mesh test
// (test/q29-chaos-mesh-translation.test.ts): one case per attack-type
// mapping + a missing/zero-length throw. The Gremlin adapter splits the
// HTTP call (injectable fetch; tested with a fake) from translation
// (this); the latter is the load-bearing logic.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  translateGremlinAttack,
  classifyGremlinAttack,
} from '../adapters/gremlin-translate';
import type { GremlinAttack } from '../adapters/gremlin-translate';
import { GremlinChaosAdapter, type FetchLike } from '../adapters/gremlin';

const T0 = 1_700_000_000;

test('Q29 Gremlin — latency → network_latency + suppress A', () => {
  const attack: GremlinAttack = { guid: 'a1', type: 'latency', length: 60 };
  const pattern = translateGremlinAttack(attack, T0);
  assert.equal(pattern.kind, 'network_latency');
  assert.deepEqual(pattern.affected_signals, ['p99_latency', 'downstream_err']);
  assert.deepEqual(pattern.suppress_families, ['A']);
  assert.equal(pattern.recovery_seconds, 60);
  assert.equal(pattern.fault_start_unix, T0);
  assert.equal(pattern.magnitude_unit, 'sigma');
  assert.equal(pattern.magnitude, 1.0);
});

test('Q29 Gremlin — blackhole → network_blackhole + suppress A', () => {
  const pattern = translateGremlinAttack({ type: 'blackhole', length: 30 }, T0);
  assert.equal(pattern.kind, 'network_blackhole');
  assert.deepEqual(pattern.suppress_families, ['A']);
  assert.equal(pattern.recovery_seconds, 30);
});

test('Q29 Gremlin — packet_loss → network_packet_loss', () => {
  const pattern = translateGremlinAttack({ type: 'packet_loss', length: 45 }, T0);
  assert.equal(pattern.kind, 'network_packet_loss');
  assert.deepEqual(pattern.affected_signals, ['p99_latency', 'downstream_err']);
});

test('Q29 Gremlin — cpu → cpu_stress', () => {
  const pattern = translateGremlinAttack({ type: 'cpu', length: 120 }, T0);
  assert.equal(pattern.kind, 'cpu_stress');
  assert.deepEqual(pattern.affected_signals, ['p99_latency', 'cost_req']);
  assert.deepEqual(pattern.suppress_families, ['A']);
});

test('Q29 Gremlin — memory → memory_stress', () => {
  const pattern = translateGremlinAttack({ type: 'memory', length: 90 }, T0);
  assert.equal(pattern.kind, 'memory_stress');
  assert.deepEqual(pattern.affected_signals, ['p99_latency', 'cost_req']);
});

test('Q29 Gremlin — shutdown → pod_shutdown', () => {
  const pattern = translateGremlinAttack({ type: 'shutdown', length: 15 }, T0);
  assert.equal(pattern.kind, 'pod_shutdown');
  assert.deepEqual(pattern.affected_signals, ['downstream_err', 'p99_latency']);
  assert.deepEqual(pattern.suppress_families, ['A']);
});

test('Q29 Gremlin — process_killer → pod_process_killer', () => {
  const pattern = translateGremlinAttack({ type: 'process_killer', length: 10 }, T0);
  assert.equal(pattern.kind, 'pod_process_killer');
  assert.deepEqual(pattern.suppress_families, ['A']);
});

test('Q29 Gremlin — time_travel → time_skew with empty suppress (let everything fire)', () => {
  const pattern = translateGremlinAttack({ type: 'time_travel', length: 90 }, T0);
  assert.equal(pattern.kind, 'time_skew');
  assert.deepEqual(pattern.affected_signals, []);
  assert.deepEqual(pattern.suppress_families, []);
});

test('Q29 Gremlin — unknown attack type falls through to gremlin_<type>', () => {
  const pattern = translateGremlinAttack({ type: 'dns', length: 20 }, T0);
  assert.equal(pattern.kind, 'gremlin_dns');
  assert.deepEqual(pattern.suppress_families, []);
  assert.deepEqual(pattern.affected_signals, []);
});

test('Q29 Gremlin — classifyGremlinAttack is a pure lookup (network family)', () => {
  assert.deepEqual(classifyGremlinAttack('latency'), {
    kind: 'network_latency',
    affected_signals: ['p99_latency', 'downstream_err'],
    suppress_families: ['A'],
  });
});

test('Q29 Gremlin — missing length throws (bounded-window invariant)', () => {
  const attack = { type: 'latency' } as unknown as GremlinAttack;
  assert.throws(() => translateGremlinAttack(attack, T0),
    /missing\/zero length/);
});

test('Q29 Gremlin — zero length throws (bounded-window invariant)', () => {
  assert.throws(() => translateGremlinAttack({ type: 'cpu', length: 0 }, T0),
    /missing\/zero length/);
});

test('Q29 Gremlin — fetchExpectedFailurePattern composes injected fetch + translate', async () => {
  const cannedAttack: GremlinAttack = { guid: 'attack-xyz', type: 'latency', length: 60 };
  let calledUrl = '';
  let calledHeaders: Record<string, string> | undefined;
  const fakeFetch: FetchLike = async (url, init) => {
    calledUrl = url;
    calledHeaders = init?.headers;
    return { ok: true, status: 200, json: async () => cannedAttack };
  };
  const adapter = new GremlinChaosAdapter('tok-123', 'team-456', fakeFetch);
  const pattern = await adapter.fetchExpectedFailurePattern('attack-xyz');
  assert.equal(calledUrl, 'https://api.gremlin.com/v1/attacks/attack-xyz');
  assert.equal(calledHeaders?.Authorization, 'Key tok-123');
  assert.equal(calledHeaders?.['X-Gremlin-Team-Id'], 'team-456');
  assert.equal(pattern.kind, 'network_latency');
  assert.equal(pattern.recovery_seconds, 60);
});

test('Q29 Gremlin — fetchExpectedFailurePattern throws on non-2xx', async () => {
  const fakeFetch: FetchLike = async () => ({
    ok: false, status: 404, json: async () => ({}),
  });
  const adapter = new GremlinChaosAdapter('tok', 'team', fakeFetch);
  await assert.rejects(() => adapter.fetchExpectedFailurePattern('missing'),
    /failed: 404/);
});

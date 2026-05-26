// test/q29-anvil-profile-validates.test.ts — Q29 / Addition #29 profile
// + schema-shape validation.
//
// Closes PRD-29 AC-3 (anvil-chaos-experiment@1.0.0 profile YAML loads
// cleanly with the expected shape) and AC-11 second case (pre-Anvil
// profiles validate unchanged — verified at engine release time, not
// in this sibling-repo's test).
//
// Post-extraction simplification: the original test invoked the full
// profile-loader (resolving extends, merging customer overrides). In the
// extracted anvil package we only need to verify the profile YAML
// itself parses and has the expected family-coverage. Inheritance from
// generic-microservice@1.0.0 is a release-time consumer concern.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';

// Resolve from either source layout (test/) or compiled layout (dist/test/).
// Source profile YAML lives at <repo>/profiles/ regardless.
function findProfilePath(): string {
  const fromSrc = path.resolve(__dirname, '..', 'profiles', 'anvil-chaos-experiment.yaml');
  if (fs.existsSync(fromSrc)) return fromSrc;
  return path.resolve(__dirname, '..', '..', 'profiles', 'anvil-chaos-experiment.yaml');
}
const PROFILE_PATH = findProfilePath();

interface AnvilProfile {
  id: string;
  version: string;
  extends?: string;
  description?: string;
  alpha_allocation?: {
    total: number;
    per_family: { A: number; B: number; C: number; D: number; E: number };
  };
  expected_failure_pattern_defaults?: {
    default_suppress_families: string[];
    default_recovery_seconds: number;
    default_magnitude_unit: 'relative_fraction' | 'absolute' | 'sigma';
  };
}

function loadAnvilProfile(): AnvilProfile {
  const raw = fs.readFileSync(PROFILE_PATH, 'utf8');
  return yaml.load(raw) as AnvilProfile;
}

test('Q29 / AC-3 — anvil-chaos-experiment.yaml parses with expected id + version', () => {
  const profile = loadAnvilProfile();
  assert.equal(profile.id, 'anvil-chaos-experiment');
  assert.equal(profile.version, '1.0.0');
});

test('Q29 / AC-3 — anvil profile extends generic-microservice', () => {
  const profile = loadAnvilProfile();
  assert.equal(profile.extends, 'generic-microservice');
});

test('Q29 / AC-3 — alpha_allocation shape: per-family sums to total', () => {
  const profile = loadAnvilProfile();
  assert.ok(profile.alpha_allocation, 'alpha_allocation block present');
  const pf = profile.alpha_allocation!.per_family;
  const sum = pf.A + pf.B + pf.C + pf.D + pf.E;
  assert.ok(Math.abs(sum - profile.alpha_allocation!.total) < 1e-9,
    `per-family sum ${sum} should equal total ${profile.alpha_allocation!.total}`);
});

test('Q29 / AC-3 — Family A enabled (primary chaos detector)', () => {
  const profile = loadAnvilProfile();
  assert.ok(profile.alpha_allocation!.per_family.A > 0, 'Family A enabled');
});

test('Q29 / AC-3 — Family C enabled (unexpected-blast catcher)', () => {
  const profile = loadAnvilProfile();
  assert.ok(profile.alpha_allocation!.per_family.C > 0, 'Family C enabled');
});

test('Q29 / AC-4 — expected_failure_pattern_defaults block has the spec-required keys', () => {
  const profile = loadAnvilProfile();
  const defaults = profile.expected_failure_pattern_defaults;
  assert.ok(defaults, 'expected_failure_pattern_defaults present');
  assert.ok(Array.isArray(defaults!.default_suppress_families), 'default_suppress_families is array');
  assert.ok(typeof defaults!.default_recovery_seconds === 'number', 'default_recovery_seconds is number');
  assert.ok(['relative_fraction', 'absolute', 'sigma'].includes(defaults!.default_magnitude_unit),
    `default_magnitude_unit ${defaults!.default_magnitude_unit} is valid`);
});

#!/usr/bin/env node
/*
 * Strip the CSP-hostile dynamic-function fallback from the generated bindings.
 *
 * protoc-gen-js emits a global bootstrap whose last resort is
 * `Function('return this')()`. Building a function from a string is blocked by
 * any strict Content-Security-Policy, which is exactly where these bindings run
 * (browser extensions and packaged wallet apps).
 *
 * The older generator emitted that call on a single line and a sed one-liner in
 * package.json rewrote it. The current generator emits a multi-line IIFE
 * instead, so that pattern silently stopped matching and the dynamic call
 * shipped in published output. Replace the call itself rather than the
 * surrounding block: that covers both the legacy and current shapes, and a
 * future generator reflow cannot quietly reintroduce it.
 *
 * Also replaces the `sed -i ''` invocation, which is BSD-only and fails on the
 * GNU sed present in CI and on Linux developer machines.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const LIB = path.join(__dirname, '..', 'lib');
const NEEDLE = "Function('return this')()";
const REPLACEMENT = 'globalThis';
const RESIDUE = /Function\(\s*['"]return this['"]\s*\)/;

if (!fs.existsSync(LIB)) {
  console.error('postprocess: ./lib does not exist -- run build:js first');
  process.exit(1);
}

const files = fs.readdirSync(LIB).filter((name) => name.endsWith('.js'));
if (files.length === 0) {
  console.error('postprocess: ./lib contains no generated .js -- run build:js first');
  process.exit(1);
}

let patched = 0;
for (const name of files) {
  const file = path.join(LIB, name);
  const before = fs.readFileSync(file, 'utf8');
  if (!before.includes(NEEDLE)) continue;
  fs.writeFileSync(file, before.split(NEEDLE).join(REPLACEMENT));
  patched += 1;
}

// The point of this step is that nothing dynamic survives it. Fail loudly
// rather than publish bindings that break under CSP.
const missed = files.filter((name) =>
  RESIDUE.test(fs.readFileSync(path.join(LIB, name), 'utf8'))
);
if (missed.length > 0) {
  console.error('postprocess: dynamic-function fallback still present in:');
  for (const name of missed) console.error(`  lib/${name}`);
  process.exit(1);
}

console.log(`postprocess: patched ${patched} of ${files.length} generated file(s)`);

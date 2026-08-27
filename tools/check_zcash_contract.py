#!/usr/bin/env python3
"""Pin the RC18 Zcash wire identifiers and compact-signature contract."""

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ZCASH = (ROOT / "messages-zcash.proto").read_text()
MESSAGES = (ROOT / "messages.proto").read_text()


def message_body(name):
    match = re.search(r"message\s+%s\s*\{(.*?)\n\}" % name, ZCASH, re.S)
    if not match:
        raise AssertionError("missing message %s" % name)
    return match.group(1)


def require_field(message, declaration):
    body = message_body(message)
    if not re.search(r"^\s*%s\s*(?://.*)?$" % declaration, body, re.M):
        raise AssertionError("%s is missing field contract: %s" % (message, declaration))


FIELDS = [
    ("ZcashSignPCZT", r"optional uint32 n_actions = 4;"),
    ("ZcashSignPCZT", r"optional uint32 n_transparent_outputs = 29;"),
    ("ZcashSignPCZT", r"optional uint32 n_transparent_inputs = 30;"),
    ("ZcashSignPCZT", r"optional bytes expected_seed_fingerprint = 31;"),
    ("ZcashPCZTAction", r"optional bool is_spend = 6;"),
    ("ZcashPCZTAction", r"optional bytes recipient = 15;"),
    ("ZcashPCZTAction", r"optional bytes rseed = 16;"),
    ("ZcashSignedPCZT", r"repeated bytes signatures = 1;"),
    ("ZcashTransparentOutput", r"required uint32 index = 1;"),
    ("ZcashTransparentInput", r"required uint32 index = 1;"),
]

for field in FIELDS:
    require_field(*field)


MESSAGE_IDS = {
    "ZcashSignPCZT": (1300, "wire_in"),
    "ZcashPCZTAction": (1301, "wire_in"),
    "ZcashPCZTActionAck": (1302, "wire_out"),
    "ZcashSignedPCZT": (1303, "wire_out"),
    "ZcashGetOrchardFVK": (1304, "wire_in"),
    "ZcashOrchardFVK": (1305, "wire_out"),
    "ZcashTransparentInput": (1306, "wire_in"),
    "ZcashTransparentSigned": (1307, "wire_out"),
    "ZcashDisplayAddress": (1308, "wire_in"),
    "ZcashAddress": (1309, "wire_out"),
    "ZcashTransparentOutput": (1310, "wire_in"),
    "ZcashTransparentAck": (1311, "wire_out"),
}

for name, (number, direction) in MESSAGE_IDS.items():
    pattern = (
        r"MessageType_%s\s*=\s*%d\s*\[\s*\(%s\)\s*=\s*true\s*\]\s*;"
        % (name, number, direction)
    )
    if not re.search(pattern, MESSAGES):
        raise AssertionError("wrong message ID or wire direction for %s" % name)


if not re.search(r"one per\s*// is_spend=true action", ZCASH):
    raise AssertionError("ZcashSignedPCZT must document compact real-spend signatures")


# RC18 is Orchard-only. The Ironwood/transaction-v6 surface is defined so tags
# 19-20 and ZcashShieldedPool value 1 stay allocated, but no firmware in this
# release implements it. Keep the fields marked schema-only so a host cannot
# read them as supported behavior.
require_field("ZcashSignPCZT", r"optional ZcashShieldedPool shielded_pool = 19 \[default = ZCASH_SHIELDED_POOL_ORCHARD\];")
require_field("ZcashSignPCZT", r"optional bytes ironwood_digest = 20;")

for pattern, description in [
    (r"^.*ZCASH_SHIELDED_POOL_IRONWOOD\s*=\s*1\s*;.*$", "the Ironwood pool value"),
    (r"^.*ironwood_digest\s*=\s*20\s*;.*$", "the Ironwood digest field"),
]:
    line = re.search(pattern, ZCASH, re.M)
    if line is None:
        raise AssertionError("missing declaration for %s" % description)
    if "SCHEMA ONLY" not in line.group(0):
        raise AssertionError(
            "%s must be marked SCHEMA ONLY on its declaration line" % description
        )

if not re.search(r"SCHEMA ONLY -- NOT IMPLEMENTED BY FIRMWARE 7\.15 / RC18", ZCASH):
    raise AssertionError(
        "ZcashSignPCZT must document that the Ironwood pool selection is schema-only"
    )

print("RC18 Zcash protocol contract: ok")

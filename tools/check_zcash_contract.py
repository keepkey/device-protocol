#!/usr/bin/env python3
"""Pin the firmware 7.15 Zcash wire identifiers and compact-signature contract."""

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
    ("ZcashPCZTAction", r"optional string user_address = 17;"),
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


# Firmware 7.15 signs both Orchard-family pools: Ironwood (NU6.3) went live on
# mainnet and needs transaction v6. Pin the tags and the documented rules, and
# refuse the old "schema only" wording, which told hosts Ironwood was rejected.
require_field("ZcashSignPCZT", r"optional ZcashShieldedPool shielded_pool = 19 \[default = ZCASH_SHIELDED_POOL_ORCHARD\];")
require_field("ZcashSignPCZT", r"optional bytes ironwood_digest = 20;")
require_field("ZcashSignPCZT", r"optional uint32 n_ironwood_actions = 21;")
require_field("ZcashSignPCZT", r"optional uint32 ironwood_flags = 22;")
require_field("ZcashSignPCZT", r"optional int64 ironwood_value_balance = 23;")

if not re.search(r"ZCASH_SHIELDED_POOL_IRONWOOD\s*=\s*1\s*;", ZCASH):
    raise AssertionError("missing declaration for the Ironwood pool value")

if "SCHEMA ONLY" in ZCASH or "NOT IMPLEMENTED BY FIRMWARE" in ZCASH:
    raise AssertionError("Ironwood is implemented by firmware 7.15; drop the schema-only wording")

for pattern, description in [
    (r"IRONWOOD requires tx_version 6, version_group_id 0xD884B698,\s*//\s*"
     r"branch_id 0x37A5165B, a 32-byte ironwood_digest", "the Ironwood v6 header rule"),
    (r"orchard_digest equal to the empty v6 Orchard digest", "the empty Orchard digest rule"),
    (r"ORCHARD in a v6 transaction requires ironwood_digest absent or equal\s*//\s*"
     r"to the empty v6 Ironwood digest, unless n_ironwood_actions > 0",
     "the empty Ironwood digest rule"),
    (r"n_actions Orchard actions are streamed first, then the\s*//\s*"
     r"n_ironwood_actions Ironwood actions", "the crossing streaming order"),
    (r"ironwood_digest in a transaction before v6 is refused", "the pre-v6 refusal"),
]:
    if not re.search(pattern, message_body("ZcashSignPCZT")):
        raise AssertionError("ZcashSignPCZT must document %s" % description)

# is_spend is optional on the wire for compatibility, but firmware requires it.
if not re.search(r"optional bool is_spend = 6;\s*//\s*required by firmware",
                 message_body("ZcashPCZTAction")):
    raise AssertionError("ZcashPCZTAction.is_spend must be documented as required by firmware")

print("Zcash protocol contract: ok")

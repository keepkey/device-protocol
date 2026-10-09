# ERC-7730 compiled definition protocol

Status: alpha format 1. All multi-byte integers are unsigned big endian unless
the field says otherwise. Decoders reject unknown required flags, non-minimal
integers, duplicate sections, out-of-order sections and trailing bytes.

## Trust boundary

The host compiles ERC-7730 v2 JSON. Firmware never trusts a host decode: the
compiled program contains types, paths and display operations, while every
displayed transaction value is read from the exact calldata or canonical
EIP-712 value stream that the device signs.

The signed envelope is purpose-separated from every older ClearSign format.
Its signature preimage begins with the 24-byte ASCII domain
`KEEPKEY:ERC7730:CATALOG\0`. A certified failure aborts signing; it never falls
back to a less specific certified display. Runtime/self-service metadata stays
additive and cannot suppress raw review.

## Envelope

| Field | Size | Meaning |
|---|---:|---|
| magic | 4 | `K773` |
| envelope version | 1 | `1` |
| purpose | 1 | `1` (ERC-7730 catalog) |
| definition length | 4 | bounded canonical program length |
| definition | variable | format below |
| proof count | 1 | number of 32-byte Merkle siblings |
| proof | 32 × count | sorted-pair SHA-256 inclusion proof |
| certificate length | 2 | root-certified delegate certificate length |
| certificate | variable | KeepKey delegation certificate |
| signature | 64 | compact secp256k1 signature over the purpose domain and catalog root |
| recovery | 1 | recovery identifier |

The leaf is `SHA256(0x00 || definition)`. An internal node is
`SHA256(0x01 || min(left,right) || max(left,right))`. The certified catalog
root is the leaf after applying every proof sibling. The delegate signature
digest is `SHA256("KEEPKEY:ERC7730:CATALOG\0" || catalog_root)`, where `\0`
is one literal NUL byte. Signing the root rather than a bare leaf lets one
signature authenticate every included definition while the leaf still binds
the exact canonical program. The delegate certificate binds that signature to
one chain and the compiled-in KeepKey root; the purpose prefix prevents replay
as v1-v4 ClearSign metadata.

On-demand offsets address this complete envelope, with offset zero at `K773`.
The definition id is SHA-256 of the complete envelope and does not make
individual ranges independently authentic. Firmware rereads an accepted
definition as a contiguous offset-zero stream, hashes and validates the full
envelope again, and stages bounded interpreter results until that replay has
matched the accepted definition id. No display result derived from replayed
bytes becomes authoritative before the final match.

## Canonical program header

The format-1 header is exactly 179 bytes.

| Field | Size |
|---|---:|
| magic | 4 (`C773`) |
| compiler format version | 1 (`1`) |
| ERC-7730 schema major/minor | 1 + 1 |
| definition kind | 1 |
| flags | 2 |
| chain id | 8 |
| contract/domain address | 20 |
| selector or primary type hash | 32 |
| source JSON SHA-256 | 32 |
| compiler identity SHA-256 | 32 |
| token/network set SHA-256 | 32 |
| provider id | 4 |
| issuance epoch | 4 |
| revocation epoch | 4 |
| section count | 1 |

Calldata definitions use the first four bytes of `selector or primary type
hash` and require its remaining bytes to be zero. EIP-712 definitions use the
complete primary type hash and bind a canonical domain-constraint section.
Address zero means that the deployment section supplies all allowed targets;
otherwise it is the single allowed target.

Each section is `type:u8 || length:u32 || payload`. Section types are strictly
ascending. Format 1 defines:

1. string table
2. ABI node table
3. path table
4. literal table
5. condition table
6. formatter table
7. display instruction table
8. deployment/domain constraints
9. resource declaration

Indices are zero-based unsigned 16-bit integers. `0xffff` is the absent index.
Strings are UTF-8, length-prefixed by a `u16`, contain no NUL, and are stored
in ascending bytewise order with duplicates forbidden. Sorting lets bounded
firmware prove interning by comparing only adjacent strings. Byte literals use
a `u16` length. Tables use a `u16` entry count followed by entries.

## Flat ABI node table

Nodes are forward-only, so cycles are structurally impossible. A node is:

`kind:u8 || size:u16 || first_child:u16 || child_count:u16 || array_length:u16`

Kinds are uint, int, address, bool, fixed bytes, bytes, string, tuple and array
(values 1 through 9). Integer size is its legal Solidity bit width. Fixed bytes
size is 1–32. Tuple children are contiguous. An array has exactly one child;
array length `0xffff` means dynamic. The root is node zero and is a tuple for
calldata. EIP-712 definitions use the same flat table for their validated value
tree.

Firmware requires canonical ABI: clean integer/address/bool/fixed-bytes
padding, valid UTF-8 strings, aligned in-bounds offsets, packed tails in member
order, no gaps/aliases/overlaps, and complete input coverage.

## Paths and display program

The compiler resolves every JSON `#`, `$` and `@` reference. A path entry
contains a source (`calldata`, `typed-data`, `container`, or `literal`), up to
16 signed 32-bit field/array indices, and an optional half-open slice. Negative
array indices are retained and resolved against the device-decoded length.
Full-array selection is an explicit flag, never an omitted index. Container
values are restricted to device-owned `from`, `to`, `value`, `chainId`, domain
and primary-type facts.

Conditions are typed operations `always`, `never`, `empty`, `not-empty`, `in`
and `not-in` over paths and literal sets. Formatters cover raw values, native
and token amounts, NFT name, date, duration, unit, enum, chain id, address,
token ticker, ERC-7930 interoperable address, embedded calldata and encrypted
field fallback. Formatter operands are typed path/literal indices; a live
result has no opcode capable of replacing a decoded operand.

Display instructions are a bounded linear program: intent text/interpolation,
field, group begin/end, array begin/end, separator and embedded call. Forward
jumps are allowed only for false conditions and loop ends. There are no
backward jumps except the bounded array iterator. Embedded calls carry a
definition lookup key and decrement the signed recursion budget.

## Exact section encodings

Sections omitted from a definition must be semantically empty. Calldata and
EIP-712 programs require sections 1, 2, 3, 6, 7, 8 and 9. Token and network
programs require sections 1, 4, 8 and 9. Section 9 is always last. Counts and
indices below are unsigned big endian; `0xffff` means absent only where stated.

### 1. String table

`count:u16`, followed by `length:u16 || UTF-8 bytes` for each string. Count is
at most 96 and length is 1 through 128 bytes. Strings are strictly increasing
by unsigned bytewise comparison. UTF-8 must be shortest-form scalar-value
encoding; surrogates, NUL, ASCII controls and DEL are rejected. Layout creates
line breaks between instructions rather than accepting descriptor-controlled
control characters.

### 2. ABI node table

`count:u16`, followed by the 9-byte nodes defined above. Node zero is the root
tuple; for an argumentless call it is the sole node and has no children.
Every non-root node has exactly one parent, every edge points forward,
and the child ranges cover exactly nodes 1 through `count-1`. This makes the
wire representation a canonical tree rather than an aliasable DAG.

### 3. Path table

`count:u16`, followed by variable-length entries:

`source:u8 || step_count:u8 || source_index:u16 || steps`

Sources are structured value (1), container (2), or literal (3). Structured
paths require `source_index=0xffff`. Container and literal paths have no steps;
their index selects a container value or section-4 literal. Container values
are from (1), to (2), value (3), chainId (4), EIP-712 domain (5), and primary
type (6).

Each step begins with an opcode:

| Opcode | Encoding | Meaning |
|---:|---|---|
| 1 | `index:i32` | tuple field or array element; array indices may be negative |
| 2 | none | all elements of the current array |
| 3 | `flags:u8 [start:i32] [end:i32]` | half-open slice; flags bit 0/1 indicate start/end |

Reserved flag bits are zero. Slice is final. Each all-elements selector
corresponds to one enclosing array instruction; nested arrays therefore
contain one selector per active array frame. The display program, not the ABI
decoder, performs bounded iteration. A path contains at most 16 steps.

### 4. Literal table

`count:u16`, followed by `kind:u8 || length:u16 || value`. Kinds are unsigned
integer (1), signed integer (2), bytes (3), string index (4), address (5), bool
(6), chain id (7), enum map (8), and byte-string set (9). Integers use minimal
big-endian magnitude/two's-complement encoding. Addresses are 20 bytes, bool is
one byte 0 or 1, and string indices are two bytes. An enum map is
`count:u16 || (key_literal:u16 || value_string:u16)*`; keys are strictly
increasing. A set is `count:u16 || literal_index:u16*`, also strictly
increasing. Nested references must point backward, preventing cycles.

### 5. Condition table

`count:u16`, followed by fixed 8-byte entries:

`opcode:u8 || path:u16 || literal_set:u16 || flags:u8 || reserved:u16`

Opcodes are always (1), never (2), optional (3), empty (4), not-empty (5), in
(6), not-in (7), and must-match (8). Always/never/optional use absent path and
set indices. Empty/not-empty use a path and no set. The remaining operations
use a path and a section-4 set. `must-match` never displays its field and aborts
clear signing if comparison fails. Reserved bits and bytes are zero.

### 6. Formatter table

`count:u16`, followed by entries
`kind:u8 || flags:u8 || argument_count:u8 || arguments`. An argument is
`role:u8 || source:u8 || index:u16`; source is path (1), literal (2), or string
(3). Arguments are strictly ordered by role and duplicate roles are rejected.

Formatter kinds are raw (1), native amount (2), token amount (3), NFT name
(4), date (5), duration (6), unit (7), enum (8), chain id (9), address name
(10), token ticker (11), ERC-7930 interoperable address (12), embedded calldata
(13), and encrypted value (14). Defined roles are value (1), token (2),
collection (3), decimals (4), base unit (5), SI-prefix flag (6), threshold (7),
threshold message (8), encoding (9), enum map (10), chain id (11), address
types (12), name sources (13), sender aliases (14), callee (15), selector (16),
amount (17), spender (18), encryption scheme (19), plaintext type (20), and
fallback label (21), native-currency address set (22), and plaintext formatter
(23). Every formatter has exactly one value role and its source is always a
path; literal constants are represented by literal-source paths. Encrypted
formatters require scheme, plaintext type and plaintext formatter roles.
Unknown kinds, roles, flags or invalid kind/role/source combinations are
rejected. Live name, token, NFT, time or decryption results can annotate the
device-decoded operand but have no representation capable of replacing it.
The token role of a token-amount formatter is optional. When absent, firmware
must display the device-decoded integer as an unknown-token value; token
threshold, chain and native-alias roles are then forbidden.

### 7. Display instruction table

`count:u16`, followed by fixed 8-byte instructions
`opcode:u8 || flags:u8 || a:u16 || b:u16 || c:u16`.

| Opcode | a | b | c |
|---:|---|---|---|
| 1 intent | fallback intent string | condition or absent | absent |
| 2 text | string | absent | absent |
| 3 interpolated value | formatter | absent | absent |
| 4 field | label string | formatter | condition or absent |
| 5 group begin | label string or absent | condition or absent | matching end PC |
| 6 group end | matching begin PC | absent | absent |
| 7 array begin | path | condition or absent | matching end PC |
| 8 array end | matching begin PC | separator string or absent | absent |
| 9 embedded call | label string or absent | calldata formatter | condition or absent |
| 10 end | absent | absent | absent |

Text and interpolated-value instructions occur only directly after an intent
and before the next field/group/end; together they are the pre-tokenized
`interpolatedIntent`. Every interpolated formatter must also appear in a field
instruction whose condition is always. Any interpolation failure selects the
fallback intent atomically. Group/array links must be properly nested and are
the only backward control flow. Array iteration consumes the shared 64-element
budget. Embedded calls consume the four-level recursion budget and reject a
definition id already present in the active call chain.

### 8. Binding and external-metadata records

`count:u16`, followed by `kind:u8 || length:u16 || payload`. Records are
strictly ordered by kind and payload and exact duplicates are rejected.

Kinds are deployment (1: `chain_id:u64 || address:20`), EIP-712 domain
constraint (2: `field:u8 || operation:u8 || literal:u16`), token (3:
`chain_id:u64 || address:20 || ticker_string:u16 || decimals:u8`), and network
(4: `chain_id:u64 || name_string:u16 || ticker_string:u16 || decimals:u8`).
Domain fields are name, version, chainId, verifyingContract and salt (1-5);
operations are equal (1) and absent (2). The header's chain/address must match
one deployment record unless its address is zero, in which case the exact
transaction target must match one. Proxy/factory resolution is performed by
the signed catalog compiler into exact deployments; an unauthenticated live
lookup cannot establish this fact.

### 9. Resource declaration

Exactly 22 bytes:

`strings:u16 || abi_nodes:u16 || paths:u16 || literals:u16 || conditions:u16 ||`
`formatters:u16 || instructions:u16 || binding_records:u16 ||`
`abi_depth:u8 || array_elements:u8 || display_depth:u8 || embedded_depth:u8 ||`
`max_string_length:u16`

All counts and maxima are recomputed while streaming and must match exactly.
Declared values above a firmware limit are rejected even when the unused
program path would not reach them.

## Fixed firmware limits (format 1)

- 64 ABI nodes and 12 levels of ABI nesting
- 64 aggregate decoded array elements
- 16 path components
- 64 paths, 64 fields and 32 conditions
- 96 interned strings, each at most 128 bytes
- 16 KiB canonical program and 1 KiB transport chunks
- 4 embedded-call levels and no repeated definition id in one call chain

The resource section repeats the compiler's exact counts. Firmware recomputes
them while parsing and rejects disagreement or exhaustion.

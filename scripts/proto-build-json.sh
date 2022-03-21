#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck >/dev/null && shellcheck "$0"

TS_PROTO_OPTS="esModuleInterop=true,forceLong=long,useOptionals=messages,useDate=false"

OUT_DIR="./lib"
COSMOS_SDK_DIR="./deps/cosmos-sdk/proto"
COSMOS_SDK_THIRD_PARTY_DIR="./deps/cosmos-sdk/third_party/proto"

PLUGIN_PATH="./node_modules/.bin/protoc-gen-ts"

mkdir -p "$OUT_DIR"

  # Build JSON files
  echo ">> Building JSON files <<"
  pbjs \
    --keep-case \
    -t json \
    --path "$COSMOS_SDK_DIR" \
    --path "$COSMOS_SDK_THIRD_PARTY_DIR" \
    ./types.proto \
    ./messages.proto \
    ./messages-eos.proto \
    ./messages-nano.proto \
    ./messages-cosmos.proto \
    ./messages-binance.proto \
    ./messages-ripple.proto \
    ./messages-tendermint.proto \
    ./messages-thorchain.proto \
    ./messages-osmosis.proto \
    ./exchange.proto \
    "$COSMOS_SDK_DIR/cosmos/auth/v1beta1/auth.proto" \
    "$COSMOS_SDK_DIR/cosmos/auth/v1beta1/genesis.proto" \
    "$COSMOS_SDK_DIR/cosmos/auth/v1beta1/query.proto" \
    "$COSMOS_SDK_DIR/cosmos/authz/v1beta1/authz.proto" \
    "$COSMOS_SDK_DIR/cosmos/authz/v1beta1/genesis.proto" \
    "$COSMOS_SDK_DIR/cosmos/authz/v1beta1/query.proto" \
    "$COSMOS_SDK_DIR/cosmos/authz/v1beta1/tx.proto" \
    "$COSMOS_SDK_DIR/cosmos/bank/v1beta1/bank.proto" \
    "$COSMOS_SDK_DIR/cosmos/bank/v1beta1/genesis.proto" \
    "$COSMOS_SDK_DIR/cosmos/bank/v1beta1/query.proto" \
    "$COSMOS_SDK_DIR/cosmos/bank/v1beta1/tx.proto" \
    "$COSMOS_SDK_DIR/cosmos/bank/v1beta1/authz.proto" \
    "$COSMOS_SDK_DIR/cosmos/base/abci/v1beta1/abci.proto" \
    "$COSMOS_SDK_DIR/cosmos/base/kv/v1beta1/kv.proto" \
    "$COSMOS_SDK_DIR/cosmos/base/query/v1beta1/pagination.proto" \
    "$COSMOS_SDK_DIR/cosmos/base/reflection/v1beta1/reflection.proto" \
    "$COSMOS_SDK_DIR/cosmos/base/snapshots/v1beta1/snapshot.proto" \
    "$COSMOS_SDK_DIR/cosmos/base/store/v1beta1/commit_info.proto" \
    "$COSMOS_SDK_DIR/cosmos/base/store/v1beta1/snapshot.proto" \
    "$COSMOS_SDK_DIR/cosmos/base/tendermint/v1beta1/query.proto" \
    "$COSMOS_SDK_DIR/cosmos/base/v1beta1/coin.proto" \
    "$COSMOS_SDK_DIR/cosmos/capability/v1beta1/capability.proto" \
    "$COSMOS_SDK_DIR/cosmos/capability/v1beta1/genesis.proto" \
    "$COSMOS_SDK_DIR/cosmos/crisis/v1beta1/genesis.proto" \
    "$COSMOS_SDK_DIR/cosmos/crisis/v1beta1/tx.proto" \
    "$COSMOS_SDK_DIR/cosmos/crypto/ed25519/keys.proto" \
    "$COSMOS_SDK_DIR/cosmos/crypto/multisig/keys.proto" \
    "$COSMOS_SDK_DIR/cosmos/crypto/multisig/v1beta1/multisig.proto" \
    "$COSMOS_SDK_DIR/cosmos/crypto/secp256k1/keys.proto" \
    "$COSMOS_SDK_DIR/cosmos/distribution/v1beta1/distribution.proto" \
    "$COSMOS_SDK_DIR/cosmos/distribution/v1beta1/genesis.proto" \
    "$COSMOS_SDK_DIR/cosmos/distribution/v1beta1/query.proto" \
    "$COSMOS_SDK_DIR/cosmos/distribution/v1beta1/tx.proto" \
    "$COSMOS_SDK_DIR/cosmos/evidence/v1beta1/evidence.proto" \
    "$COSMOS_SDK_DIR/cosmos/evidence/v1beta1/genesis.proto" \
    "$COSMOS_SDK_DIR/cosmos/evidence/v1beta1/query.proto" \
    "$COSMOS_SDK_DIR/cosmos/evidence/v1beta1/tx.proto" \
    "$COSMOS_SDK_DIR/cosmos/feegrant/v1beta1/feegrant.proto" \
    "$COSMOS_SDK_DIR/cosmos/feegrant/v1beta1/genesis.proto" \
    "$COSMOS_SDK_DIR/cosmos/feegrant/v1beta1/query.proto" \
    "$COSMOS_SDK_DIR/cosmos/feegrant/v1beta1/tx.proto" \
    "$COSMOS_SDK_DIR/cosmos/genutil/v1beta1/genesis.proto" \
    "$COSMOS_SDK_DIR/cosmos/gov/v1beta1/genesis.proto" \
    "$COSMOS_SDK_DIR/cosmos/gov/v1beta1/gov.proto" \
    "$COSMOS_SDK_DIR/cosmos/gov/v1beta1/query.proto" \
    "$COSMOS_SDK_DIR/cosmos/gov/v1beta1/tx.proto" \
    "$COSMOS_SDK_DIR/cosmos/mint/v1beta1/genesis.proto" \
    "$COSMOS_SDK_DIR/cosmos/mint/v1beta1/mint.proto" \
    "$COSMOS_SDK_DIR/cosmos/mint/v1beta1/query.proto" \
    "$COSMOS_SDK_DIR/cosmos/params/v1beta1/params.proto" \
    "$COSMOS_SDK_DIR/cosmos/params/v1beta1/query.proto" \
    "$COSMOS_SDK_DIR/cosmos/slashing/v1beta1/genesis.proto" \
    "$COSMOS_SDK_DIR/cosmos/slashing/v1beta1/query.proto" \
    "$COSMOS_SDK_DIR/cosmos/slashing/v1beta1/slashing.proto" \
    "$COSMOS_SDK_DIR/cosmos/slashing/v1beta1/tx.proto" \
    "$COSMOS_SDK_DIR/cosmos/staking/v1beta1/genesis.proto" \
    "$COSMOS_SDK_DIR/cosmos/staking/v1beta1/query.proto" \
    "$COSMOS_SDK_DIR/cosmos/staking/v1beta1/staking.proto" \
    "$COSMOS_SDK_DIR/cosmos/staking/v1beta1/tx.proto" \
    "$COSMOS_SDK_DIR/cosmos/staking/v1beta1/authz.proto" \
    "$COSMOS_SDK_DIR/cosmos/tx/signing/v1beta1/signing.proto" \
    "$COSMOS_SDK_DIR/cosmos/tx/v1beta1/service.proto" \
    "$COSMOS_SDK_DIR/cosmos/tx/v1beta1/tx.proto" \
    "$COSMOS_SDK_DIR/cosmos/upgrade/v1beta1/query.proto" \
    "$COSMOS_SDK_DIR/cosmos/upgrade/v1beta1/upgrade.proto" \
    "$COSMOS_SDK_DIR/cosmos/vesting/v1beta1/tx.proto" \
    "$COSMOS_SDK_DIR/cosmos/vesting/v1beta1/vesting.proto" \
    > ./lib/proto.json
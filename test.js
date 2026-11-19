const fs = require('fs')
const path = require('path')

const libDir = path.join(__dirname, 'lib')
const requiredFiles = [
  'proto.json',
  'messages_pb.js',
  'messages_pb.d.ts',
  'types_pb.js',
  'types_pb.d.ts',
  'messages-ethereum_pb.js',
  'messages-cosmos_pb.js',
  'messages-binance_pb.js',
  'messages-ripple_pb.js',
  'messages-thorchain_pb.js',
  'messages-osmosis_pb.js',
  'messages-mayachain_pb.js',
  'messages-solana_pb.js',
  'messages-zcash_pb.js',
  'messages-tron_pb.js',
  'messages-ton_pb.js',
  'messages-hive_pb.js',
  'messages-near_pb.js',
  'messages-monero_pb.js',
]

let failed = 0
for (const file of requiredFiles) {
  const filePath = path.join(libDir, file)
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
    console.error(`FAIL: missing or empty ${file}`)
    failed++
  }
}

const proto = JSON.parse(fs.readFileSync(path.join(libDir, 'proto.json'), 'utf8'))
const hasNested = (name, value = proto) => {
  if (!value || typeof value !== 'object') return false
  if (Object.prototype.hasOwnProperty.call(value, name)) return true
  return Object.values(value).some((child) => hasNested(name, child))
}

const requiredMessages = [
  'GetBip85Mnemonic',
  'SolanaSignTx',
  'clearsign_certificate',
  'EthereumSignTypedData',
  'ZcashSignPCZT',
  'HiveSignOperations',
  'NearSignTx',
  'MoneroTxInitRequest',
  'TronGetAddress',
  'TonGetAddress',
]

for (const message of requiredMessages) {
  if (!hasNested(message)) {
    console.error(`FAIL: proto.json missing ${message}`)
    failed++
  }
}

try {
  const messages = require('./lib/messages_pb')
  const types = require('./lib/types_pb')
  console.log(`messages_pb exports ${Object.keys(messages).length} symbols`)
  console.log(`types_pb exports ${Object.keys(types).length} symbols`)
} catch (error) {
  console.error(`FAIL: generated modules do not load: ${error.message}`)
  failed++
}

// Compare the signed wire integers to independent BigInt varints. Both the
// setters and the deserializers must preserve every atomic unit.
function checkUint64(Message, field, tag, decimal) {
  const assert = require('assert')
  const message = new Message()
  message['set' + field](decimal)
  let value = BigInt(decimal)
  const wire = [tag]
  do {
    const byte = Number(value & 0x7fn)
    value >>= 7n
    wire.push(byte | (value ? 0x80 : 0))
  } while (value)
  assert.deepStrictEqual(Array.from(message.serializeBinary()), wire)
  const decoded = Message.deserializeBinary(Uint8Array.from(wire))
  assert.strictEqual(decoded['get' + field](), decimal)
  assert.strictEqual(decoded.toObject()[field[0].toLowerCase() + field.slice(1)], decimal)
}

const { EthereumClearSignDefinitionRequest } = require('./lib/messages-ethereum_pb')
const xmr = require('./lib/messages-monero_pb')
const exactUint64Fields = [
  [EthereumClearSignDefinitionRequest, 'ChainId', 0x10],
  [xmr.MoneroTxDestination, 'Amount', 0x08],
  [xmr.MoneroTxChange, 'Amount', 0x08],
  [xmr.MoneroTxData, 'Fee', 0x28],
  [xmr.MoneroTxRingMember, 'GlobalIndex', 0x08],
  [xmr.MoneroTxSourceEntry, 'Amount', 0x30],
  [xmr.MoneroTxAllOutSetAck, 'Fee', 0x18],
]
for (const [Message, field, tag] of exactUint64Fields) {
  for (const decimal of ['1', '9007199254740991', '9007199254740993', '18446744073709551615']) {
    try {
      checkUint64(Message, field, tag, decimal)
    } catch (error) {
      console.error(`FAIL: uint64 ${field} ${decimal}: ${error.message}`)
      failed++
    }
  }
}

if (failed) {
  console.error(`${failed} package validation check(s) failed`)
  process.exit(1)
}

console.log('All package validation checks passed')

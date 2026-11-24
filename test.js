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

// Fixed protobuf acknowledgements, encoded independently with Python
// ChaCha20Poly1305. The synthetic signature scalars exercise the wire layout.
{
  const assert = require('assert')
  const { createDecipheriv } = require('crypto')
  const stepWire = Buffer.from(
    '0a80010a0ca0a1a2a3a4a5a6a7a8a9aaab1a70' +
    '0b8b3376ab7741cc48fda05462b4329830565e8f3c5900a820efbade23532bf5' +
    '6d80168aaec9ff8ac6ccf5bd1d5178464ac44a38090c6b8127540b404c2aa5c8b3' +
    'fb674e38e992f022f0d2890db0a97e00990fe31cbc96a07b284a808ecca0bbb63' +
    'fa39a8db231cbf824ea10dc477584', 'hex')
  const finalWire = Buffer.from(
    '0a20000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f', 'hex')
  const [item] = xmr.MoneroKeyImageSyncStepAck.deserializeBinary(stepWire).getKisList()
  const key = xmr.MoneroKeyImageSyncFinalAck.deserializeBinary(finalWire).getEncKey_asU8()
  const blob = item.getBlob_asU8()
  assert.strictEqual(blob.length, 112)
  const cipher = createDecipheriv('chacha20-poly1305', key, item.getIv_asU8(), { authTagLength: 16 })
  cipher.setAuthTag(blob.subarray(96))
  const plain = Buffer.concat([cipher.update(blob.subarray(0, 96)), cipher.final()])
  assert.strictEqual(plain.subarray(0, 32).toString('hex'),
    '07204b29e6918361e8f253409e4ecf63ad088d307f33600b9437616f5231e8f9')
  assert.strictEqual(plain.subarray(32, 64).toString('hex'), '01' + '00'.repeat(31))
  assert.strictEqual(plain.subarray(64).toString('hex'), '02' + '00'.repeat(31))
}

if (failed) {
  console.error(`${failed} package validation check(s) failed`)
  process.exit(1)
}

console.log('All package validation checks passed')

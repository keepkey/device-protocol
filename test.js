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

if (failed) {
  console.error(`${failed} package validation check(s) failed`)
  process.exit(1)
}

console.log('All package validation checks passed')

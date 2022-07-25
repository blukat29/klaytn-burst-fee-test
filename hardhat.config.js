require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

async function sleep(ms) {
  if (ms <= 0) return;
  return new Promise(resolve => setTimeout(resolve, ms));
}

task('tx', 'get transaction and receipt')
.addPositionalParam("txid", "Transaction hash")
.setAction(async ({ txid }) => {
  const tx = await hre.ethers.provider.getTransaction(txid);
  const rc = await hre.ethers.provider.getTransactionReceipt(txid);
  console.log(tx);
  console.log(rc);
});

task('history', 'get block gas and base fee history')
.addOptionalParam("start", "Start block number (default: 0)", "0")
.addOptionalParam("end", "End block number (default: latest)", "latest")
.addFlag("follow", "Follow latest block indefinitely")
.setAction(async ({ start, end, follow }) => {

  const headNum = parseInt(await hre.ethers.provider.getBlockNumber());
  start = (start == "latest") ? headNum : parseInt(start);
  end = (end == "latest") ? headNum : parseInt(end);

  console.log("num,base_fee,block_gas,tx_count");

  for (var num = start; num <= end; num++) {
    const block = await hre.ethers.provider.getBlock(parseInt(num));
    console.log(`${block.number}, ${block.baseFeePerGas}, ${block.gasUsed}, ${block.transactions.length}`);
  }

  var clock = Date.now();
  while (follow) {
    clock += 1000;
    await sleep(clock - Date.now());

    const block = await hre.ethers.provider.getBlock("latest");
    console.log(`${block.number}, ${block.baseFeePerGas}, ${block.gasUsed}, ${block.transactions.length}`);
  }
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      { version: '0.8.9',
        settings: { optimizer: { enabled: true, runs: 1000 } } },
    ],
  },
  defaultNetwork: 'hardhat',
  networks: {
    'hardhat': {},
    'local': {
      url: "http://127.0.0.1:8551",
      chainId: 2019,
      accounts: [
        process.env.LOCAL_ACCOUNT_KEY || '0x00000000000000000000000000000000000000000000000000000000cafebabe',
      ],
      gasburner: process.env.LOCAL_GASBURNER_ADDR,
    },
    'baobab': {
      url: "https://api.baobab.klaytn.net:8651",
      chainId: 1001,
      gasPrice: 250e9,
      accounts: [
        process.env.BAOBAB_ACCOUNT_KEY || '0x00000000000000000000000000000000000000000000000000000000cafebabe',
      ],
      gasburner: process.env.BAOBAB_GASBURNER_ADDR || '0xA891ae326E92e5FBfa63dA11F2caD94E9824DF6F',
    }
  }
};

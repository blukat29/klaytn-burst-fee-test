require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

task('tx', 'get transaction and receipt')
.addParam("txid", "Transaction hash")
.setAction(async ({ txid }) => {
  const tx = await hre.ethers.provider.getTransaction(txid);
  const rc = await hre.ethers.provider.getTransactionReceipt(txid);
  console.log(tx);
  console.log(rc);
});

task('history', 'get block gas and base fee history')
.addOptionalParam("start", "Start block", "0")
.addOptionalParam("end", "End block", "100")
.setAction(async ({ start, end }) => {
  console.log("num,block_gas,base_fee");
  for (var i=start; i<=end; i++) {
    const block = await hre.ethers.provider.getBlock(parseInt(i));
    console.log(`${block.number}, ${block.gasUsed}, ${block.baseFeePerGas}`);
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

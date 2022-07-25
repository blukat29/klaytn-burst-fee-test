require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

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

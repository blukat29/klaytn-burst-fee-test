// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const addr = hre.network.config.gasburner;
  console.log('Using contract at', addr);
  const Burner = await hre.ethers.getContractFactory("GasBurner");
  const burner = await Burner.attach(addr)

  // 10   iter = 47183   gas
  // 1000 iter = 1844033 gas
  // 2000 iter = 3659033 gas
  // (gas = 29033 + 1815*iter)
  const tx = await burner.consume(2000);
  console.log(tx);
  const rc = await tx.wait();
  console.log(rc);

  console.log('TXID', tx.hash);
  console.log('Block', rc.blockNumber);
  console.log('GasUsed', rc.gasUsed.toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

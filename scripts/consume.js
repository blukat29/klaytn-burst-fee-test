// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function consume(burner, gas, nonce) {
  // 10   iter = 47183   gas
  // 1000 iter = 1844033 gas
  // 2000 iter = 3659033 gas
  // (gas = 29033 + 1815*iter)
  // (iter = (gas - 29033) / 1815)

  var iter = Math.floor((gas - 29033) / 1815);
  const tx = await burner.consume(iter, {
    gasPrice: 750e9,
    gasLimit: 9e6,
    nonce: nonce,
  });
  console.log(`SENT [${Date.now()/1000}] #${nonce || ''} ${tx.hash} gas ${gas}`);
  return tx;
  // const rc = await tx.wait();
  // console.log(rc);

  // console.log(`TX ${tx.hash} at block ${rc.blockNumber} gas ${rc.gasUsed}`);
}

async function main() {
  const addr = hre.network.config.gasburner;
  const Burner = await hre.ethers.getContractFactory("GasBurner");
  const burner = await Burner.attach(addr)
  const accounts = await hre.ethers.getSigners();
  const sender = accounts[0];

  var nonce = await hre.ethers.provider.getTransactionCount(sender.address);
  var num = await hre.ethers.provider.getBlockNumber();

  console.log(`contract: ${burner.address}`);
  console.log(`sender: ${sender.address}`);
  console.log(`nonce: ${nonce}`);
  console.log(`block: ${num}`);
  console.log(`>>> STARTING\n`);

  promises = [];
  for (var i=0; i<10; i++) {
    var now = Date.now();
    await sleep(1000 - (now % 1000));
    promises.push(consume(burner, 1e5, nonce + i));
  }
  await Promise.all(promises);

  num = await hre.ethers.provider.getBlockNumber();
  console.log(`\n<<< ENDED`);
  console.log(`block: ${num}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

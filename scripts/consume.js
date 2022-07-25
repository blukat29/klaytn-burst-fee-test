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

async function consumeOnce(burner, gas, nonce) {
  // 10    iter = 47183     gas
  // 1000  iter = 1844033   gas
  // 2000  iter = 3659033   gas
  // 8000  iter = 14549033  gas
  // 8300+ iter = 100000000 gas (ErrOpcodeComputationCostLimitReached)
  // (gas = 29033 + 1815*iter)
  // (iter = (gas - 29033) / 1815)

  var iter = Math.floor((gas - 29033) / 1815);
  const tx = await burner.consume(iter, {
    gasPrice: 750e9,
    gasLimit: 1e7,
    nonce: nonce,
  });

  var now = (Date.now()/1000).toString().padEnd(14,'0');
  var txNonce = (nonce || tx.nonce).toString().padStart(3,' ');
  console.log(`SENT [${now}] #${nonce} ${tx.hash} gas ${gas} iter ${iter}`);
  // fire-and-forget. do not wait for receipt.
  return tx;
}

async function consumeBurst(burner, gas, nonce, txPerBlock, numBlocks) {
  for (var i = 0; i < numBlocks; i++) {
    var now = Date.now();
    await sleep(1000 - (now % 1000)); // loop every second

    for (var j = 0; j < txPerBlock; j++) {
      consumeOnce(burner, gas, nonce);
      nonce++
    }
  }
}

async function consumePattern(burner, nonce) {
  var bursts = [
    { gas: 1e7, txPerBlock: 3, numBlocks: 10 },
  ];

  for (var i = 0; i < bursts.length; i++) {
    var burst = bursts[i];
    await consumeBurst(burner, burst.gas, nonce, burst.txPerBlock, burst.numBlocks);
    nonce += burst.txPerBlock * burst.numBlocks;
  }
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

  await consumePattern(burner, nonce);

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

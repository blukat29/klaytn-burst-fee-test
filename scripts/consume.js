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

// Send a transaction that consumes at least `gas`.
async function consumeOnce(burner, gas, nonce) {
  // 10    iter = 47183     gas
  // 1000  iter = 1844033   gas
  // 2000  iter = 3659033   gas
  // 8000  iter = 14549033  gas
  // 8300+ iter = 100000000 gas (ErrOpcodeComputationCostLimitReached)
  // (gas = 29033 + 1815*iter)
  var iter = Math.ceil((gas - 29033) / 1815);

  // If `iter` is larger than certain value, gasUsed = gasLimit.
  // In that case we control the gasUsed using gasLimit.
  var gasLimit = 1e7;
  if (iter > 8000) {
    gasLimit = gas;
  }

  const tx = await burner.consume(iter, {
    gasPrice: 750e9,
    gasLimit: gasLimit,
    nonce: nonce,
  });

  var now = (Date.now()/1000).toString().padEnd(14,'0');
  var txNonce = (nonce || tx.nonce).toString().padStart(3,' ');
  console.log(`SENT [${now}] #${nonce} ${tx.hash} gas ${gas} iter ${iter}`);
  // fire-and-forget. do not wait for receipt.
  return tx;
}

async function consumeBurst(burner, gas, nonce, count) {
  for (var i = 0; i < count; i++) {
    var now = Date.now();
    await sleep(1500 - (now % 1000)); // start the loop at exactly X.5 sec.

    if (gas == "random") {
      randomGas = Math.floor(Math.random() * 5e7) + 1e7;
      consumeOnce(burner, randomGas, nonce + i);
    } else {
      consumeOnce(burner, gas, nonce + i);
    }
  }
}

async function consumePattern(burner, nonce) {
  var bursts = [
    { gas: 1e5, count: 4 }, // warmup
    // max change rate
    { gas: 9e7, count: 100 },
    { gas: 1e5, count: 100 },
    { gas: 6e7, count: 100 },
    { gas: 1e5, count: 100 },
    // slow change rate
    { gas: 4e7, count: 100 },
    { gas: 2e7, count: 100 },
    // random walk
    { gas: 6e7, count: 50 },
    { gas: "random", count: 100 },
  ];

  for (var i = 0; i < bursts.length; i++) {
    var burst = bursts[i];
    await consumeBurst(burner, burst.gas, nonce, burst.count);
    nonce += burst.count;
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

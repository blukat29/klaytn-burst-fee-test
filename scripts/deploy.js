// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const accounts = await hre.ethers.getSigners();
  const sender = accounts[0];
  console.log('Deploying from', sender.address);

  const Burner = await hre.ethers.getContractFactory("GasBurner");
  const burner = await Burner.deploy();

  await burner.deployed();
  console.log("Deployed at", burner.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

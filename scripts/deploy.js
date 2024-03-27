// scripts/deploy.js

async function main() {
  const [deployer] = await ethers.getSigners(); // Get the account to deploy the contract

  console.log("Deploying contracts with the account:", deployer.address);

  const NumberCasino = await ethers.getContractFactory("NumberCasino");
  const numberCasino = await NumberCasino.deploy();

  // await numberCasino.deployed();

  console.log("MyContract deployed to:", numberCasino.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

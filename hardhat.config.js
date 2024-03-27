require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.0",
  networks: {
    hardhat: {
      // ... (other configurations)
    },
    mumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/EcSrakQPOXrrDZq9rY3D_JPAlVe6QpBO",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
    },
  },
  sourcify: {
    enabled: true,
  },
};

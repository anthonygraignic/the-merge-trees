import 'dotenv/config';
import {HardhatUserConfig} from 'hardhat/config';
import '@nomicfoundation/hardhat-ethers';
// import '@nomiclabs/hardhat-etherscan';
import '@nomicfoundation/hardhat-verify';
import '@nomicfoundation/hardhat-ignition-ethers';
import 'hardhat-gas-reporter';
import '@typechain/hardhat';
import '@nomicfoundation/hardhat-chai-matchers';
import 'solidity-coverage';
import 'hardhat-contract-sizer';
import 'hardhat-abi-exporter';

// import 'hardhat-deploy-tenderly';
import {nodeUrl, accounts, accountsFromPrivateKeys} from './utils/network';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1824,
      },
    },
  },
  networks: {
    hardhat: {
      accounts: accounts(),
      // mining: {
      //   auto: false,
      //   interval: 500,
      // },
    },
    // sepolia: {
    //   url: process.env.SEPOLIA_URL || '',
    //   accounts: [process.env.SEPOLIA_DEPLOYER_SECRET || '', process.env.SEPOLIA_FOUNDERS_SECRET || ''],
    // },
    // mainnet: {
    //   url: process.env.MAINNET_URL || '',
    //   accounts: [process.env.MAINNET_DEPLOYER_SECRET || '', process.env.MAINNET_FOUNDERS_SECRET || ''],
    // },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
    gasPrice: 21,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v6',
  },
  abiExporter: {
    path: './abi',
    runOnCompile: true,
    clear: true,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;

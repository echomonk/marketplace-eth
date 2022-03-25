const HDWalletProvider = require("@truffle/hdwallet-provider");
const keys = require("./keys.json")


module.exports = {
  contracts_build_directory: "./public/contracts",
  networks: {
    development: {
     host: "127.0.0.1",
     port: 7545,
     network_id: "*",
    },
    ropsten: {
      provider: () =>
        new HDWalletProvider({
          mnemonic: {
            phrase: keys.MNEMONIC
          },
          providerOrUrl: `wss://ropsten.infura.io/ws/v3/${keys.INFURA_PROJECT_ID}`,
          addressIndex: 0
        }),
      network_id: 3,
      gas: 5500000, // Gas Limit, How much gas we are willing to spend
      gasPrice: 20000000000, // how much we are willing to spend for unit of gas
      confirmations: 2, // number of blocks to wait between deployment
      timeoutBlocks: 200 // number of blocks before deployment times out
    }
  },
  compilers: {
    solc: {
      version: "0.8.4",
    }
  }
}

// 5500000 * 20000000000 = 110000000000000000 = 0,11 ETH => 326,68 USD

// transaction hash: 0x136e2917b15beb5f44467fe44892a325c6c3ee346bd8d29ae280e7b17211cc35
// contract address: 0x4Aa288Ab3F9115c23F387D88e811fA436800e77F

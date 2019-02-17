module.exports = {
  networks: {
    develop: {
      accounts: 5
    },
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 5000000,
    },
    sesamed: {
      host: "localhost",
      port: 8504,
      network_id: 219,
      gas: 5000000
    }
  },
  compilers: {
    solc: {
      settings: {
        optimizer: {
          enabled: true, // Default: false
          runs: 200      // Default: 200
        },
      }
    }
  }
};

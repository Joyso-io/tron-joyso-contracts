require('dotenv').config();

module.exports = {
  networks: {
    development: {
      consume_user_resource_percent: 30,
      fee_limit: 700000000,
      fullNode: "http://127.0.0.1:8090",
      solidityNode: "http://127.0.0.1:8091",
      eventServer: "http://127.0.0.1:8092",
      network_id: "*"
    },
    shasta: {
      privateKey: process.env.DEPLOY_PK,
      consume_user_resource_percent: 30,
      fee_limit: 700000000,
      fullNode: "https://api.shasta.trongrid.io",
      solidityNode: "https://api.shasta.trongrid.io",
      eventServer: "https://api.shasta.trongrid.io",
      network_id: "*"
    },
    mainnet: {
      privateKey: process.env.DEPLOY_PK,
      consume_user_resource_percent: 30,
      fee_limit: 700000000,
      fullNode: "https://api.trongrid.io",
      solidityNode: "https://api.trongrid.io",
      eventServer: "https://api.trongrid.io",
      network_id: "*"
    }
  }
};

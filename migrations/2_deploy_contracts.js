const Joyso = artifacts.require('./Joyso.sol');
const TronWeb = require('tronweb');
const tronbox = require('../tronbox');

module.exports = function(deployer) {
  if (!process.env.JOYSO_WALLET || !process.env.JOY_TOKEN) {
    throw new Error('.env is not set.');
  }
  const config = tronbox.networks[deployer.network];
  const tronWeb = new TronWeb(config.fullNode, config.solidityNode, config.eventServer);
  tronWeb.trx.getCurrentBlock((err, block) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Block number: ', block.block_header.raw_data.number);
      console.log('Block hash: ', block.blockID);
    }
  });
  deployer.deploy(Joyso, process.env.JOYSO_WALLET, process.env.JOY_TOKEN).then(() => {
    return Joyso.deployed();
  }).then(instance => {
    if (process.env.ADMIN) {
      instance.addToAdmin(process.env.ADMIN, true);
    }
    if (process.env.TOKENS) {
      const tokens = process.env.TOKENS.split(',');
      tokens.forEach((token, index) => {
        instance.registerToken(token, index + 2);
      });
    }
  });
};

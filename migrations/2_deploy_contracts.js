const Joyso = artifacts.require('./Joyso.sol');
const TokenSender = artifacts.require('./TokenSender.sol');
const TronWeb = require('tronweb');
const tronbox = require('../tronbox');

const joy = process.env.JOY_TOKEN;

module.exports = function(deployer) {
  if (!process.env.JOYSO_WALLET || !joy) {
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

  deployer.deploy(Joyso, process.env.JOYSO_WALLET, joy)
    .then(() => deployer.deploy(TokenSender))
    .then(() => Promise.all([Joyso.deployed(), TokenSender.deployed()]))
    .then(([joyso, tokenSender]) => {
      if (process.env.ADMIN) {
        const admins = process.env.ADMIN.split(',');
        admins.forEach(admin => {
          joyso.addToAdmin(admin, true);
        });
      }
      if (process.env.TOKENS) {
        const tokens = process.env.TOKENS.split(',');
        tokens.forEach((token, index) => {
          joyso.registerToken(token, index + 2);
        });
      }
      if (process.env.TRANSFER_ADMIN) {
        tokenSender.addToAdmin(process.env.TRANSFER_ADMIN, true);
      }
      tokenSender.setJoysoContractAddress(joyso.address);
      tokenSender.tokenApprove(joy);
      joyso.addToAdmin(tokenSender.address, true);
      if (process.env.TRANSFER_ADMIN_PK) {
        tronWeb.contract().at(joy).then(joyContract => {
          joyContract.methods.approve(tokenSender.address, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').send({
            feeLimit: 12000000,
            callValue: 0,
            shouldPollResponse: false
          }, process.env.TRANSFER_ADMIN_PK);
        });
      }
    });
};

'use strict';

const Joyso = artifacts.require('./Joyso.sol');
const TestToken = artifacts.require('./testing/TestToken.sol');
const helper = require('./support/helper.js');

contract('Joyso misc.js', function (accounts) {
  const admin = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const joysoWallet = accounts[4];
  const ONE =Number(tronWeb.toSun(amount)).toFixed(0);
  const ETHER = '410000000000000000000000000000000000000000';

  it('it should fail if not admin send the match', async function () {
    const temp = await helper.setupEnvironment(accounts);
    const joyso = temp[0];
    const token = temp[1];

    const inputs = [];
    const order1 = await helper.generateOrder(200000000000000, 1000000, 1000000000000, 10, 20, 10, 0, true, ETHER, token.address, user1, joyso.address);
    inputs.push(...order1);
    const order2 = await helper.generateOrder(150, 15000000000, 1000000000000, 11, 20, 10, 0, false, token.address, ETHER, user2, joyso.address);
    inputs.push(...order2);

    const tx1 = await joyso.matchByAdmin_TwH36(inputs, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'REVERT');


  });

  it('deposit should fail, if the deposit token is not registered ', async function () {
    const joy = await TestToken.deployed();
    const joyso = await JoysoMock.deployed();
    const token = await TestTokenTwo.deployed();
    const tx1 = await token.transfer(user1, ONE, { from: admin });
    const tx2 = await token.approve(joyso.address, ONE, { from: user1 });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    const receipt2 = await tronWeb.trx.getTransactionInfo(tx2);
    assert.equal(receipt1.receipt.result, 'SUCCESS');
    assert.equal(receipt2.receipt.result, 'SUCCESS');

    
    const tx3 = await joyso.depositToken(token.address, ONE, { from: user1 });
    await helper.timeout(4000);
    const receipt3 = await tronWeb.trx.getTransactionInfo(tx3);
    assert.equal(receipt3.receipt.result, 'REVERT');


  });

  it('it should fail if the token is not approved to the joyso contract', async function () {
    const joy = await TestToken.deployed();
    const joyso = await JoysoMock.deployed();
    const token = await TestTokenTwo.deployed();
    const tx1 = await token.transfer(user1, ONE, { from: admin });
    const tx2 = await joyso.registerToken(token.address, 0x57, { from: admin });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    const receipt2 = await tronWeb.trx.getTransactionInfo(tx2);
    assert.equal(receipt1.receipt.result, 'SUCCESS');
    assert.equal(receipt2.receipt.result, 'SUCCESS');


    const tx3 =  await joyso.depositToken(token.address, ONE, { from: user1 });
    await helper.timeout(4000);
    const receipt3 = await tronWeb.trx.getTransactionInfo(tx3);
    assert.equal(receipt3.receipt.result, 'REVERT');

  });

  it("registerToken's index should more than 1", async function () {
    const joy = await TestToken.deployed();
    const joyso = await JoysoMock.deployed();
    const token = await TestTokenTwo.deployed();
    const tx1 = await token.transfer(user1, ONE, { from: admin });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'SUCCESS');

    const tx2 = await joyso.registerToken(token.address, 0x00, { from: admin });
    await helper.timeout(4000);
    const receipt2 = await tronWeb.trx.getTransactionInfo(tx2);
    assert.equal(receipt2.receipt.result, 'REVERT');
    
  });

  it('the same token can not registered twice ', async function () {
    const joy = await TestToken.deployed();
    const joyso = await JoysoMock.deployed();
    const token = await TestTokenTwo.deployed();
    const tx1 = await token.transfer(user1, ONE, { from: admin });
    const tx2 = await joyso.registerToken(token.address, 0x57, { from: admin });
    await helper.timeout(4000);
    assert.equal(receipt1.receipt.result, 'SUCCESS');
    assert.equal(receipt2.receipt.result, 'SUCCESS');

    const tx3 = await joyso.registerToken(token.address, 0x56, { from: admin });
    await helper.timeout(4000);
    const receipt3 = await tronWeb.trx.getTransactionInfo(tx3);
    assert.equal(receipt3.receipt.result, 'REVERT');
  });

  it('add new admin', async function () {
    const temp = await helper.setupEnvironment(accounts);
    const joyso = temp[0];
    const token = temp[1];

    const inputs = [];
    const order1 = await helper.generateOrder(200000000000000, 1000000, 1000000000000, 10, 20, 10, 0, true, ETHER, token.address, user1, joyso.address);
    inputs.push(...order1);
    const order2 = await helper.generateOrder(150, 15000000000, 1000000000000, 11, 20, 10, 0, false, token.address, ETHER, user2, joyso.address);
    inputs.push(...order2);
    await joyso.addToAdmin(user1, true, { from: admin });
    await joyso.matchByAdmin_TwH36(inputs, { from: user1 });
  });

  it('for case1, maker and taker order exchage the place should still success', async function () {
    const temp = await helper.setupEnvironment(accounts);
    const joyso = temp[0];
    const token = temp[1];

    const inputs = [];
    const order1 = await helper.generateOrder(200000000000000, 1000000, 1000000000000, 10, 20, 10, 0, true, ETHER, token.address, user1, joyso.address);

    const order2 = await helper.generateOrder(150, 15000000000, 1000000000000, 11, 20, 10, 0, false, token.address, ETHER, user2, joyso.address);
    inputs.push(...order2);
    inputs.push(...order1);
    await joyso.matchByAdmin_TwH36(inputs, { from: admin });
  });

  it("register token can not use other token's index", async function () {
    const joy = await TestToken.deployed();
    const joyso = await JoysoMock.deployed();
    const token = await TestTokenTwo.deployed();

    //const token2 = await TestToken.new('tt', 'tt', 18, { from: admin });
    const tx1 = await token.transfer(user1, ONE, { from: admin });
    await helper.timeout(4000);
    assert.equal(receipt1.receipt.result, 'SUCCESS');
    //await joyso.registerToken(token.address, 0x57, { from: admin });

    const tx2 = await joyso.registerToken(token.address,1, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt2 = await tronWeb.trx.getTransactionInfo(tx3);
    assert.equal(receipt2.receipt.result, 'REVERT');
    
   
  });

  it('owner collectFee', async function () {
    const temp = await helper.setupEnvironment(accounts);
    const joyso = temp[0];
    const token = temp[1];
    const joy = temp[2];

    const inputs = [];
    const order1 = await helper.generateOrder(10000000000000000, 10000000, 150000000000000000, 10, 20, 10, 0, true, ETHER, token.address, user2, joyso.address);
    Array.prototype.push.apply(inputs, order1);
    const order2 = await helper.generateOrder(10000000, 10000000000000000, 1500000000, 11, 10, 5, 0x3e80, 0, token.address, ETHER, user1, joyso.address);
    Array.prototype.push.apply(inputs, order2);

    const adminEtherBalance = await web3.eth.getBalance(admin);
    const adminJOYBalance = await joy.balanceOf(admin);

    const tx1 = await joyso.matchByAdmin_TwH36(inputs, { from: admin });
    await helper.timeout(4000);
    assert.equal(receipt1.receipt.result, 'SUCCESS');
    
    // collectFee from user should fail
    
    const tx2 = await joyso.collectFee(ETHER, { from: user1 });
    await helper.timeout(4000);
    const receipt2 = await tronWeb.trx.getTransactionInfo(tx3);
    assert.equal(receipt2.receipt.result, 'REVERT');
    

    await joyso.collectFee(ETHER, { from: admin });
    await joyso.collectFee(joy.address, { from: admin });

    const adminEtherBalance1 = await web3.eth.getBalance(admin);
    const adminJOYBalance1 = await joy.balanceOf(admin);
    const joysoWalletContractEtherBalance1 = await joyso.getBalance(ETHER, joysoWallet);
    const joysoWalletContractJOYBalance1 = await joyso.getBalance(joy.address, joysoWallet);
    assert.isAbove(adminEtherBalance1.sub(adminEtherBalance), 0);
    assert.isAbove(adminJOYBalance1.sub(adminJOYBalance), 0);
    assert.equal(joysoWalletContractEtherBalance1, 0);
    assert.equal(joysoWalletContractJOYBalance1, 0);
  });

  it('transferForAdmin', async function () {
    const temp = await helper.setupEnvironment(accounts);
    const joyso = temp[0];
    const joy = temp[2];

    const user1JOYBalance = await joyso.getBalance(joy.address, user1);
    const user2JOYBalance = await joyso.getBalance(joy.address, user2);

    await joyso.addToAdmin(user1, true, { from: admin });
    await joyso.transferForAdmin(joy.address, user2, 500000, { from: user1 });

    const user1JOYBalance1 = await joyso.getBalance(joy.address, user1);
    const user2JOYBalance1 = await joyso.getBalance(joy.address, user2);

    assert.equal(user2JOYBalance1.sub(user2JOYBalance), 500000);
    assert.equal(user1JOYBalance.sub(user1JOYBalance1), 500000);
  });
});

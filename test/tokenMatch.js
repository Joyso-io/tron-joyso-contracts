'use strict';

const Joyso = artifacts.require('./Joyso.sol');
const TestToken = artifacts.require('./testing/TestToken.sol');
const helper = require('./support/helper.js');

contract('tokenMatch.js', accounts => {
  const admin = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const joysoWallet = accounts[4];
  const ETHER = '410000000000000000000000000000000000000000';
  let joyso, joy, token;

  beforeEach(async () => {
    const temp = await helper.setupEnvironment(accounts)
    joyso = temp[0];
    token = temp[1];
    joy = temp[2];
  });

  it('try token base match', async () => {
    const inputs = [];
    const order1 = await helper.generateTokenOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000001, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    inputs.push(...order1);

    const order2 = await helper.generateTokenOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000002, 20, 10, 0, false, token.address, ETHER, user2, joyso);
    inputs.push(...order2);

    const user1EtherBalance = await joyso.getBalance(ETHER, user1);
    const user2EtherBalance = await joyso.getBalance(ETHER, user2);
    const user1TokenBalance = await joyso.getBalance(token.address, user1);
    const user2TokenBalance = await joyso.getBalance(token.address, user2);
    const joysoEtherBalance = await joyso.getBalance(ETHER, joysoWallet);

    const tx = await joyso.matchTokenOrderByAdmin_k44j(inputs, { from: admin, gas: 4700000 });
    const txReceipt = await web3.eth.getTransactionReceipt(tx);
    console.log('2 order match: ' + txReceipt.gasUsed);

    const user1EtherBalance2 = await joyso.getBalance(ETHER, user1);
    const user2EtherBalance2 = await joyso.getBalance(ETHER, user2);
    const user1TokenBalance2 = await joyso.getBalance(token.address, user1);
    const user2TokenBalance2 = await joyso.getBalance(token.address, user2);
    const joysoEtherBalance2 = await joyso.getBalance(ETHER, joysoWallet);

    // await helper.displayTheBalance(joyso.address, token.address, 0)
    assert.equal(user1EtherBalance - user1EtherBalance2, helper.tron(0.5 + 0.01 + 0.001), 'user1Ether');
    assert.equal(user2EtherBalance2 - user2EtherBalance, helper.tron(0.5 - 0.01 - 0.0005), 'user2Ether');
    assert.equal(user1TokenBalance2 - user1TokenBalance, helper.tron(0.5), 'user1Token');
    assert.equal(user2TokenBalance - user2TokenBalance2, helper.tron(0.5), 'user2Token');
    assert.equal(joysoEtherBalance2 - joysoEtherBalance, helper.tron(0.01 + 0.01 + 0.001 + 0.0005), 'joysoEther');
  });

  it('token by token match', async () => {
    const inputs = [];
    const order1 = await helper.generateTokenOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000001, 20, 10, 0, true, joy.address, token.address, user1, joyso);
    const order2 = await helper.generateTokenOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000002, 20, 10, 0, false, token.address, joy.address, user2, joyso);
    inputs.push(...order1);
    inputs.push(...order2);

    const user1JoyBalance = await joyso.getBalance(joy.address, user1);
    const user2JoyBalance = await joyso.getBalance(joy.address, user2);
    const user1TokenBalance = await joyso.getBalance(token.address, user1);
    const user2TokenBalance = await joyso.getBalance(token.address, user2);
    const joysoJoyBalance = await joyso.getBalance(joy.address, joysoWallet);

    await joyso.matchTokenOrderByAdmin_k44j(inputs, { from: admin });
    const user1JoyBalance2 = await joyso.getBalance(joy.address, user1);
    const user2JoyBalance2 = await joyso.getBalance(joy.address, user2);
    const user1TokenBalance2 = await joyso.getBalance(token.address, user1);
    const user2TokenBalance2 = await joyso.getBalance(token.address, user2);
    const joysoJoyBalance2 = await joyso.getBalance(joy.address, joysoWallet);

    assert.equal(user1JoyBalance - user1JoyBalance2, helper.tron(0.5 + 0.01 + 0.001), 'user1Base');
    assert.equal(user2JoyBalance2 - user2JoyBalance, helper.tron(0.5 - 0.01 - 0.0005), 'user2Base');
    assert.equal(user1TokenBalance2 - user1TokenBalance, helper.tron(0.5), 'user1Token');
    assert.equal(user2TokenBalance - user2TokenBalance2, helper.tron(0.5), 'user2Token');
    assert.equal(joysoJoyBalance2 - joysoJoyBalance, helper.tron(0.01 + 0.01 + 0.001 + 0.0005), 'joysoBase');
  });

  it('try token base match, taker is a sell order', async () => {
    const inputs = [];
    const order1 = await helper.generateTokenOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000001, 20, 10, 0, true, ETHER, token.address, user1, joyso.address);

    const order2 = await helper.generateTokenOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000002, 20, 10, 0, false, token.address, ETHER, user2, joyso.address);
    inputs.push(...order2);
    inputs.push(...order1);

    const user1EtherBalance = await joyso.getBalance(ETHER, user1);
    const user2EtherBalance = await joyso.getBalance(ETHER, user2);
    const user1TokenBalance = await joyso.getBalance(token.address, user1);
    const user2TokenBalance = await joyso.getBalance(token.address, user2);
    const joysoEtherBalance = await joyso.getBalance(ETHER, joysoWallet);

    await joyso.matchTokenOrderByAdmin_k44j(inputs, { from: admin });
    const user1EtherBalance2 = await joyso.getBalance(ETHER, user1);
    const user2EtherBalance2 = await joyso.getBalance(ETHER, user2);
    const user1TokenBalance2 = await joyso.getBalance(token.address, user1);
    const user2TokenBalance2 = await joyso.getBalance(token.address, user2);
    const joysoEtherBalance2 = await joyso.getBalance(ETHER, joysoWallet);

    // await helper.displayTheBalance(joyso.address, token.address, 0)
    assert.equal(user1EtherBalance - user1EtherBalance2, helper.tron(0.5 + 0.01 + 0.0005), 'user1Ether');
    assert.equal(user2EtherBalance2 - user2EtherBalance, helper.tron(0.5 - 0.01 - 0.001), 'user2Ether');
    assert.equal(user1TokenBalance2 - user1TokenBalance, helper.tron(0.5), 'user1Token');
    assert.equal(user2TokenBalance - user2TokenBalance2, helper.tron(0.5), 'user2Token');
    assert.equal(joysoEtherBalance2 - joysoEtherBalance, helper.tron(0.01 + 0.01 + 0.001 + 0.0005), 'joysoEther');
  });

  it("it should fail if taker's signature is wrong.", async () => {
    const inputs = [];
    const order1 = await helper.generateTokenOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000001, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    inputs.push(...order1);
    inputs[5] = 1234; // s

    const order2 = await helper.generateTokenOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000002, 20, 10, 0, false, token.address, ETHER, user2, joyso);
    inputs.push(...order2);

    
    const tx1 = await joyso.matchTokenOrderByAdmin_k44j(inputs, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'REVERT');
  });

  it("it should fail if the maker's signature is wrong", async () => {
    const inputs = [];
    const order1 = await helper.generateTokenOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000001, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    inputs.push(...order1);

    const order2 = await helper.generateTokenOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000002, 20, 10, 0, false, token.address, ETHER, user2, joyso);
    inputs.push(...order2);
    inputs[11] = 1234; // s

    
    const tx1 = await joyso.matchTokenOrderByAdmin_k44j(inputs, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'REVERT');
  });

  it('a filled taker order should not be trade again', async () => {
    const inputs = [];
    const order1 = await helper.generateTokenOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000001, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    inputs.push(...order1);

    const order2 = await helper.generateTokenOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000002, 20, 10, 0, false, token.address, ETHER, user2, joyso);
    inputs.push(...order2);
    const tx1 = await joyso.matchTokenOrderByAdmin_k44j(inputs, { from: admin });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'SUCCESS');

    const tx2 = await joyso.matchTokenOrderByAdmin_k44j(inputs, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt2 = await tronWeb.trx.getTransactionInfo(tx2);
    assert.equal(receipt2.receipt.result, 'REVERT');
  });

  it('a filled maker order should not be trade again', async () => {
    let inputs = [];
    const order1 = await helper.generateTokenOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000001, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    inputs.push(...order1);

    const order2 = await helper.generateTokenOrder(helper.tron(0.7), helper.tron(0.7), helper.tron(0.01),
      0x0000002, 20, 10, 0, false, token.address, ETHER, user2, joyso);
    inputs.push(...order2);
    const tx1 = await joyso.matchTokenOrderByAdmin_k44j(inputs, { from: admin });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'SUCCESS');
    const order3 = await helper.generateTokenOrder(helper.tron(0.1), helper.tron(0.1), helper.tron(0.01),
      0x0000001, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    inputs = [];
    inputs.push(...order3);
    inputs.push(...order2);

    const tx2 = await joyso.matchTokenOrderByAdmin_k44j(inputs, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt2 = await tronWeb.trx.getTransactionInfo(tx2);
    assert.equal(receipt2.receipt.result, 'REVERT');
  });

  it("it should fail if the price taker's price is worse than maker's", async () => {
    const inputs = [];
    const order1 = await helper.generateTokenOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000001, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    inputs.push(...order1);

    const order2 = await helper.generateTokenOrder(helper.tron(0.1), helper.tron(0.5), helper.tron(0.01),
      0x0000002, 20, 10, 0, false, token.address, ETHER, user2, joyso);
    inputs.push(...order2);

    const tx2 = await joyso.matchTokenOrderByAdmin_k44j(inputs, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt2 = await tronWeb.trx.getTransactionInfo(tx2);
    assert.equal(receipt2.receipt.result, 'REVERT');
  });
});

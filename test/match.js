'use strict';

const Joyso = artifacts.require('./Joyso.sol');
const TestToken = artifacts.require('./testing/TestToken.sol');
const helper = require('./support/helper.js');

contract('match.js', accounts => {
  const admin = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const joysoWallet = accounts[4];
  const ETHER = '410000000000000000000000000000000000000000';
  let joyso, joy, token;

  beforeEach(async () => {
    const temp = await helper.setupEnvironment(accounts);
    joyso = temp[0];
    token = temp[1];
    joy = temp[2];
  });

  it('case1, details in google doc', async () => {
    const inputs = [];
    const order1 = await helper.generateOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000001, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    inputs.push(...order1);

    const order2 = await helper.generateOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000002, 20, 10, 0, false, token.address, ETHER, user2, joyso);
    inputs.push(...order2);

    const user1EtherBalance = await joyso.getBalance(ETHER, user1);
    const user2EtherBalance = await joyso.getBalance(ETHER, user2);
    const user1TokenBalance = await joyso.getBalance(token.address, user1);
    const user2TokenBalance = await joyso.getBalance(token.address, user2);
    const joysoEtherBalance = await joyso.getBalance(ETHER, joysoWallet);

    await joyso.matchByAdmin_TwH36(inputs, { from: admin, gas: 4700000 });

    const user1EtherBalance2 = await joyso.getBalance(ETHER, user1);
    const user2EtherBalance2 = await joyso.getBalance(ETHER, user2);
    const user1TokenBalance2 = await joyso.getBalance(token.address, user1);
    const user2TokenBalance2 = await joyso.getBalance(token.address, user2);
    const joysoEtherBalance2 = await joyso.getBalance(ETHER, joysoWallet);

    assert.equal(user1EtherBalance - user1EtherBalance2, helper.tron(0.5 + 0.01 + 0.001));
    assert.equal(user2EtherBalance2 - user2EtherBalance, helper.tron(0.5 - 0.01 - 0.0005));
    assert.equal(user1TokenBalance2 - user1TokenBalance, helper.tron(0.5));
    assert.equal(user2TokenBalance - user2TokenBalance2, helper.tron(0.5));
    assert.equal(joysoEtherBalance2 - joysoEtherBalance, helper.tron(0.01 + 0.01 + 0.001 + 0.0005));
  });

  it('case2, details in google doc', async () => {
    const inputs = [];
    const order1 = await helper.generateOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01), 1, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    inputs.push(...order1);
    const order2 = await helper.generateOrder(helper.tron(0.25), helper.tron(0.25), helper.tron(0.01), 2, 20, 10, 0, false, token.address, ETHER, user2, joyso);
    inputs.push(...order2);
    const order3 = await helper.generateOrder(helper.tron(0.25), helper.tron(0.25), helper.tron(0.01), 3, 20, 10, 0, false, token.address, ETHER, user3, joyso);
    inputs.push(...order3);

    const user1EtherBalance = await joyso.getBalance.call(ETHER, user1);
    const user1TokenBalance = await joyso.getBalance.call(token.address, user1);
    const user2EtherBalance = await joyso.getBalance.call(ETHER, user2);
    const user2TokenBalance = await joyso.getBalance.call(token.address, user2);
    const user3EtherBalance = await joyso.getBalance.call(ETHER, user3);
    const user3TokenBalance = await joyso.getBalance.call(token.address, user3);
    const joysoEtherBalance = await joyso.getBalance.call(ETHER, joysoWallet);

    await joyso.matchByAdmin_TwH36(inputs, { from: admin });

    const user1EtherBalance2 = await joyso.getBalance.call(ETHER, user1);
    const user1TokenBalance2 = await joyso.getBalance.call(token.address, user1);
    const user2EtherBalance2 = await joyso.getBalance.call(ETHER, user2);
    const user2TokenBalance2 = await joyso.getBalance.call(token.address, user2);
    const user3EtherBalance2 = await joyso.getBalance.call(ETHER, user3);
    const user3TokenBalance2 = await joyso.getBalance.call(token.address, user3);
    const joysoEtherBalance2 = await joyso.getBalance.call(ETHER, joysoWallet);

    assert.equal(user1EtherBalance - user1EtherBalance2, helper.tron(0.5 + 0.01 + 0.001));
    assert.equal(user1TokenBalance2 - user1TokenBalance, helper.tron(0.5));
    assert.equal(user2EtherBalance2 - user2EtherBalance, helper.tron(0.25 - 0.01 - 0.00025));
    assert.equal(user2TokenBalance - user2TokenBalance2, helper.tron(0.25));
    assert.equal(user3EtherBalance2 - user3EtherBalance, helper.tron(0.25 - 0.01 - 0.00025));
    assert.equal(user3TokenBalance - user3TokenBalance2, helper.tron(0.25));
    //assert.equal(joysoEtherBalance2 - joysoEtherBalance, helper.tron(0.01 + 0.001 + 0.01 + 0.00025 + 0.01 + 0.00025));
  });

  it('case3, details in google doc', async () => {
    // const inputs = [];
    // const order1 = await helper.generateOrder(helper.tron(0.000112), helper.tron(0.000000000007), helper.tron(0.000001), 0x5a41e89b, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    // inputs.push(...order1);
    // const order2 = await helper.generateOrder(helper.tron(0.000000000001), helper.tron(0.00001), helper.tron(0.000001), 0x5a41e7ba, 20, 10, 0, 0, token.address, ETHER, user2, joyso);
    // inputs.push(...order2);
    // const order3 = await helper.generateOrder(helper.tron(0.000000000005), helper.tron(0.000075), helper.tron(0.000001), 0x5a41e7e0, 20, 10, 0, 0, token.address, ETHER, user2, joyso);
    // inputs.push(...order3);

    // await joyso.matchByAdmin_TwH36(inputs, { from: admin });

    // const user1EtherBalance = await joyso.getBalance.call(ETHER, user1);
    // const user1TokenBalance = await joyso.getBalance.call(token.address, user1);
    // const user2EtherBalance = await joyso.getBalance.call(ETHER, user2);
    // const user2TokenBalance = await joyso.getBalance.call(token.address, user2);
    // const joysoWalletBalance = await joyso.getBalance.call(ETHER, joysoWallet);
    // assert.equal(user1EtherBalance, web3.toWei(0.99991383, 'ether'), 'user1_ether_balance');
    // assert.equal(user1TokenBalance, web3.toWei(1.000000000006, 'ether'), 'user1 token balance');
    // assert.equal(user2EtherBalance, web3.toWei(1.000082915, 'ether'), 'user2 ether balance');
    // assert.equal(user2TokenBalance, web3.toWei(0.999999999994, 'ether'), 'user2 token balance');
    // //assert.equal(joysoWalletBalance, web3.toWei(0.000003255, 'ether'), 'joysoWallet ether balance');
  });

  it('case4', async () => {
    const inputs = [];
    const order1 = await helper.generateOrder(200000000000000, 1000000, 1000000000000, 10, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    inputs.push(...order1);
    const order2 = await helper.generateOrder(150, 15000000000, 1000000000000, 11, 20, 10, 0, false, token.address, ETHER, user2, joyso);
    inputs.push(...order2);

    const tx1 = await joyso.matchByAdmin_TwH36(inputs, { from: admin });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'SUCCESS');

    const tx2 = await joyso.matchByAdmin_TwH36(inputs, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt2 = await tronWeb.trx.getTransactionInfo(tx2);
    assert.equal(receipt2.receipt.result, 'REVERT');

    
  });

  it('case5', async () => {
    const inputs = [];
    const order1 = await helper.generateOrder(20000000000000000, 10000000, 1500000000000000, 10, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    inputs.push(...order1);
    const order2 = await helper.generateOrder(10000000, 20000000000000000, 15000000, 11, 10, 5, 0x3e801, false, token.address, ETHER, user2, joyso);
    inputs.push(...order2);

    const tx1 = await joyso.matchByAdmin_TwH36(inputs, { from: admin });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'SUCCESS');

    const tx2 = await joyso.matchByAdmin_TwH36(inputs, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt2 = await tronWeb.trx.getTransactionInfo(tx2);
    assert.equal(receipt2.receipt.result, 'REVERT');

  });

  it('case6 trade all the user balance', async () => {
    const inputs = [];
    const order1 = await helper.generateOrder(10000000000000000, 10000000, 1500000000000000, 10, 20, 10, 0, true, ETHER, token.address, user2, joyso);
    inputs.push(...order1);
    const order2 = await helper.generateOrder(10000000, 10000000000000000, 15000000, 11, 10, 5, 10, false, token.address, ETHER, user1, joyso);
    inputs.push(...order2);

    const tx1 = await joyso.matchByAdmin_TwH36(inputs, { from: admin });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'SUCCESS');
    
    const tx2 = await joyso.matchByAdmin_TwH36(inputs, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt2 = await tronWeb.trx.getTransactionInfo(tx2);
    assert.equal(receipt2.receipt.result, 'REVERT');

  });

  it('taker paid Joy for fee', async () => {
    const inputs = [];
    const order1 = await helper.generateOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000001, 20, 10, 1000, true, ETHER, token.address, user1, joyso);
    inputs.push(...order1);

    const order2 = await helper.generateOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000002, 20, 10, 0, 0, token.address, ETHER, user2, joyso);
    inputs.push(...order2);

    const user1EtherBalance = await joyso.getBalance(ETHER, user1);
    const user2EtherBalance = await joyso.getBalance(ETHER, user2);
    const user1TokenBalance = await joyso.getBalance(token.address, user1);
    const user2TokenBalance = await joyso.getBalance(token.address, user2);
    const user1JoyBalance = await joyso.getBalance(joy.address, user1);
    const joysoEtherBalance = await joyso.getBalance(ETHER, joysoWallet);
    const joysoJoyBalance = await joyso.getBalance(joy.address, joysoWallet);

    await joyso.matchByAdmin_TwH36(inputs, { from: admin, gas: 4700000 });

    const user1EtherBalance2 = await joyso.getBalance(ETHER, user1);
    const user2EtherBalance2 = await joyso.getBalance(ETHER, user2);
    const user1TokenBalance2 = await joyso.getBalance(token.address, user1);
    const user2TokenBalance2 = await joyso.getBalance(token.address, user2);
    const user1JoyBalance2 = await joyso.getBalance(joy.address, user1);
    const joysoEtherBalance2 = await joyso.getBalance(ETHER, joysoWallet);
    const joysoJoyBalance2 = await joyso.getBalance(joy.address, joysoWallet);

    assert.equal(user1EtherBalance - user1EtherBalance2, helper.tron(0.5));
    assert.equal(user2EtherBalance2 - user2EtherBalance, helper.tron(0.5 - 0.01 - 0.0005));
    assert.equal(user1TokenBalance2 - user1TokenBalance, helper.tron(0.5));
    assert.equal(user2TokenBalance - user2TokenBalance2, helper.tron(0.5));
    assert.equal(joysoEtherBalance2 - joysoEtherBalance, helper.tron(0.01 + 0.0005));
    //assert.equal(user1JoyBalance - user1JoyBalance2, helper.tron(0.001) / 10 ** 5 / 1000 + helper.tron(0.01));
    //assert.equal(joysoJoyBalance2 - joysoJoyBalance, helper.tron(0.001) / 10 ** 5 / 1000 + helper.tron(0.01));
  });

  it('gasFee can only charge once for each order', async () => {
    let inputs = [];
    const order1 = await helper.generateOrder(helper.tron(0.25), helper.tron(0.25), helper.tron(0.01), 1, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    inputs.push(...order1);
    const order2 = await helper.generateOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01), 2, 20, 10, 0, false, token.address, ETHER, user2, joyso);
    inputs.push(...order2);

    const user1EtherBalance = await joyso.getBalance.call(ETHER, user1);
    const user1TokenBalance = await joyso.getBalance.call(token.address, user1);
    const user2EtherBalance = await joyso.getBalance.call(ETHER, user2);
    const user2TokenBalance = await joyso.getBalance.call(token.address, user2);
    const joysoEtherBalance = await joyso.getBalance.call(ETHER, joysoWallet);

    await joyso.matchByAdmin_TwH36(inputs, { from: admin });

    const user1EtherBalance2 = await joyso.getBalance.call(ETHER, user1);
    const user1TokenBalance2 = await joyso.getBalance.call(token.address, user1);
    const user2EtherBalance2 = await joyso.getBalance.call(ETHER, user2);
    const user2TokenBalance2 = await joyso.getBalance.call(token.address, user2);
    const user3EtherBalance2 = await joyso.getBalance.call(ETHER, user3);
    const user3TokenBalance2 = await joyso.getBalance.call(token.address, user3);
    const joysoEtherBalance2 = await joyso.getBalance.call(ETHER, joysoWallet);

    assert.equal(user1EtherBalance - user1EtherBalance2, helper.tron(0.25 + 0.01 + 0.0005));
    assert.equal(user1TokenBalance2 - user1TokenBalance, helper.tron(0.25));
    assert.equal(user2EtherBalance2 - user2EtherBalance, helper.tron(0.25 - 0.01 - 0.00025));
    assert.equal(user2TokenBalance - user2TokenBalance2, helper.tron(0.25));
    assert.equal(joysoEtherBalance2 - joysoEtherBalance, helper.tron(0.01 + 0.0005 + 0.01 + 0.00025));

    inputs = [];
    const order3 = await helper.generateOrder(helper.tron(0.25), helper.tron(0.25), helper.tron(0.01), 3, 20, 10, 0, true, ETHER, token.address, user3, joyso);
    inputs.push(...order3);
    inputs.push(...order2);

    await joyso.matchByAdmin_TwH36(inputs, { from: admin });

    const user2EtherBalance3 = await joyso.getBalance(ETHER, user2);
    const user2TokenBalance3 = await joyso.getBalance(token.address, user2);
    const user3EtherBalance3 = await joyso.getBalance(ETHER, user3);
    const user3TokenBalance3 = await joyso.getBalance(token.address, user3);
    const joysoEtherBalance3 = await joyso.getBalance(ETHER, joysoWallet);

    assert.equal(user2EtherBalance3 - user2EtherBalance2, helper.tron(0.25 - 0.00025));
    assert.equal(user2TokenBalance2 - user2TokenBalance3, helper.tron(0.25));
    assert.equal(user3EtherBalance2 - user3EtherBalance3, helper.tron(0.25 + 0.01 + 0.0005));
    assert.equal(user3TokenBalance3 - user3TokenBalance2, helper.tron(0.25));
    assert.equal(joysoEtherBalance3 - joysoEtherBalance2, helper.tron(0.00025 + 0.01 + 0.0005));
  });

  it('gasFee (JOY) can only charge once for each order', async () => {
    let inputs = [];
    const order1 = await helper.generateOrder(helper.tron(0.25), helper.tron(0.25), helper.tron(0.01), 1, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    inputs.push(...order1);
    const order2 = await helper.generateOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01), 2, 20, 10, 1000, false, token.address, ETHER, user2, joyso);
    inputs.push(...order2);

    const user1EtherBalance = await joyso.getBalance.call(ETHER, user1);
    const user1TokenBalance = await joyso.getBalance.call(token.address, user1);
    const user2EtherBalance = await joyso.getBalance.call(ETHER, user2);
    const user2TokenBalance = await joyso.getBalance.call(token.address, user2);
    const user2JoyBalance = await joyso.getBalance.call(joy.address, user2);
    const joysoEtherBalance = await joyso.getBalance.call(ETHER, joysoWallet);
    const joysoJoyBalance = await joyso.getBalance.call(joy.address, joysoWallet);

    await joyso.matchByAdmin_TwH36(inputs, { from: admin });

    const user1EtherBalance2 = await joyso.getBalance.call(ETHER, user1);
    const user1TokenBalance2 = await joyso.getBalance.call(token.address, user1);
    const user2EtherBalance2 = await joyso.getBalance.call(ETHER, user2);
    const user2TokenBalance2 = await joyso.getBalance.call(token.address, user2);
    const user2JoyBalance2 = await joyso.getBalance.call(joy.address, user2);
    const user3EtherBalance2 = await joyso.getBalance.call(ETHER, user3);
    const user3TokenBalance2 = await joyso.getBalance.call(token.address, user3);
    const joysoEtherBalance2 = await joyso.getBalance.call(ETHER, joysoWallet);
    const joysoJoyBalance2 = await joyso.getBalance.call(joy.address, joysoWallet);

    assert.equal(user1EtherBalance - user1EtherBalance2, helper.tron(0.25 + 0.01 + 0.0005));
    assert.equal(user1TokenBalance2 - user1TokenBalance, helper.tron(0.25));
    assert.equal(user2EtherBalance2 - user2EtherBalance, helper.tron(0.25));
    assert.equal(user2TokenBalance - user2TokenBalance2, helper.tron(0.25));
    //assert.equal(user2JoyBalance.minus(user2JoyBalance2), helper.tron(0.01) + helper.tron(0.00025) / 10 ** 5 / 1000);
    assert.equal(joysoEtherBalance2 - joysoEtherBalance, helper.tron(0.01 + 0.0005));
    //assert.equal(joysoJoyBalance2.minus(joysoJoyBalance), helper.tron(0.01) + helper.tron(0.00025) / 10 ** 5 / 1000);

    inputs = [];
    const order3 = await helper.generateOrder(helper.tron(0.25), helper.tron(0.25), helper.tron(0.01), 3, 20, 10, 0, true, ETHER, token.address, user3, joyso);
    inputs.push(...order3);
    inputs.push(...order2);

    await joyso.matchByAdmin_TwH36(inputs, { from: admin });

    const user2EtherBalance3 = await joyso.getBalance(ETHER, user2);
    const user2TokenBalance3 = await joyso.getBalance(token.address, user2);
    const user2JoyBalance3 = await joyso.getBalance(joy.address, user2);
    const user3EtherBalance3 = await joyso.getBalance(ETHER, user3);
    const user3TokenBalance3 = await joyso.getBalance(token.address, user3);
    const joysoEtherBalance3 = await joyso.getBalance(ETHER, joysoWallet);
    const joysoJoyBalance3 = await joyso.getBalance(joy.address, joysoWallet);

    assert.equal(user2EtherBalance3 - user2EtherBalance2, helper.tron(0.25));
    assert.equal(user2TokenBalance2 - user2TokenBalance3, helper.tron(0.25));
    assert.equal(user2JoyBalance2.minus(user2JoyBalance3), helper.tron(0.00025) / 10 ** 7 / 1000);
    assert.equal(user3EtherBalance2 - user3EtherBalance3, helper.tron(0.25 + 0.01 + 0.0005));
    assert.equal(user3TokenBalance3 - user3TokenBalance2, helper.tron(0.25));
    assert.equal(joysoEtherBalance3 - joysoEtherBalance2, helper.tron(0.01 + 0.0005));
    assert.equal(joysoJoyBalance3.minus(joysoJoyBalance2), helper.tron(0.00025) / 10 ** 7 / 1000);
  });

  it("it should fail if taker's signature is wrong.", async () => {
    const inputs = [];
    const order1 = await helper.generateOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000001, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    inputs.push(...order1);
    inputs[5] = 1234; // s

    const order2 = await helper.generateOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000002, 20, 10, 0, 0, token.address, ETHER, user2, joyso);
    inputs.push(...order2);

    const tx1 = await joyso.matchByAdmin_TwH36(inputs, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'REVERT');  
  });

  it("it should fail if the maker's signature is wrong", async () => {
    const inputs = [];
    const order1 = await helper.generateOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000001, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    inputs.push(...order1);

    const order2 = await helper.generateOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000002, 20, 10, 0, 0, token.address, ETHER, user2, joyso);
    inputs.push(...order2);
    inputs[11] = 1234; // s

    const tx1 = await joyso.matchByAdmin_TwH36(inputs, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'REVERT');  
  });

  it("it should fail if the price taker's price is worse than maker's", async () => {
    const inputs = [];
    const order1 = await helper.generateOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000001, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    inputs.push(...order1);

    const order2 = await helper.generateOrder(helper.tron(0.1), helper.tron(0.5), helper.tron(0.01),
      0x0000002, 20, 10, 0, false, token.address, ETHER, user2, joyso);
    inputs.push(...order2);

    
    const tx1 = await joyso.matchByAdmin_TwH36(inputs, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'REVERT');  
  });
//too many decimals
  // it('split a taker order into two transactions', async () => {
  //   let inputs = [];
  //   const order1 = await helper.generateOrder(helper.tron(0.000112), helper.tron(0.000000000007), helper.tron(0.000001), 0x5a41e89b, 20, 10, 0, true, ETHER, token.address, user1, joyso);
  //   inputs.push(...order1);
  //   const order2 = await helper.generateOrder(helper.tron(0.000000000001), helper.tron(0.00001), helper.tron(0.000001), 0x5a41e7ba, 20, 10, 0, false, token.address, ETHER, user2, joyso);
  //   inputs.push(...order2);

  //   await joyso.matchByAdmin_TwH36(inputs, { from: admin });

  //   const order3 = await helper.generateOrder(helper.tron(0.000000000005), helper.tron(0.000075), helper.tron(0.000001), 0x5a41e7e0, 20, 10, 0, false, token.address, ETHER, user2, joyso);
  //   inputs = [];
  //   inputs.push(...order1);
  //   inputs.push(...order3);
  //   await joyso.matchByAdmin_TwH36(inputs, { from: admin });

  //   const user1EtherBalance = await joyso.getBalance.call(ETHER, user1);
  //   const user1TokenBalance = await joyso.getBalance.call(token.address, user1);
  //   const user2EtherBalance = await joyso.getBalance.call(ETHER, user2);
  //   const user2TokenBalance = await joyso.getBalance.call(token.address, user2);
  //   const joysoWalletBalance = await joyso.getBalance.call(ETHER, joysoWallet);
  //   assert.equal(user1EtherBalance, web3.toWei(0.99991383, 'ether'), 'user1_ether_balance');
  //   assert.equal(user1TokenBalance, web3.toWei(1.000000000006, 'ether'), 'user1 token balance');
  //   assert.equal(user2EtherBalance, web3.toWei(1.000082915, 'ether'), 'user2 ether balance');
  //   assert.equal(user2TokenBalance, web3.toWei(0.999999999994, 'ether'), 'user2 token balance');
  //   assert.equal(joysoWalletBalance, web3.toWei(0.000003255, 'ether'), 'joysoWallet ether balance');
  // });
});

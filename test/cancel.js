'use strict';

const Joyso = artifacts.require('./Joyso.sol');
const TestToken = artifacts.require('./testing/TestToken.sol');
const helper = require('./support/helper.js');

contract('cancel.js', accounts => {
  const admin = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const ETHER = '410000000000000000000000000000000000000000';
  let joyso, joy, token;

  beforeEach(async () => {
      const temp = await helper.setupEnvironment(accounts);
      joyso = temp[0];
      token = temp[1];
      joy = temp[2];
  });

  it('cancelByAdmin should update the user nonce', async () => {
    const inputs = await helper.generateCancel(helper.tron(0.001), 0x1234, 0, user1, joyso);
    const tx = await joyso.cancelByAdmin(inputs, { from: admin, gas: 4700000 });
    const txReceipt = await tronWeb.trx.getTransactionInfo(tx);
    console.log('gas: ' + txReceipt.gasUsed);

    const user1Nonce = await joyso.userNonce.call(user1);
    assert.equal(user1Nonce, 0x1234);
  });

  it('nonce should more than current nonce', async () => {
    let inputs = await helper.generateCancel(helper.tron(0.001), 0x1234, 0, user1, joyso);
    const tx1 = await joyso.cancelByAdmin(inputs, { from: admin });

    inputs = await helper.generateCancel(helper.tron(0.001), 0x123, 0, user1, joyso);
    const tx2 = await joyso.cancelByAdmin(inputs, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    const receipt2 = await tronWeb.trx.getTransactionInfo(tx2);
    assert.equal(receipt1.receipt.result, 'SUCCESS');
    assert.equal(receipt2.receipt.result, 'REVERT');
  });

  it('pay joy for fee to cancel the order', async () => {
    const joyBalance = await joyso.getBalance(joy.address, user1);

    const inputs = await helper.generateCancel(1000000, 0x1234, 1, user1, joyso);
    await joyso.cancelByAdmin(inputs, { from: admin });

    const joyBalance2 = await joyso.getBalance(joy.address, user1);
    assert.equal(joyBalance.sub(joyBalance2), 1000000);
  });

  it('cancel should fail if user\'s signature is wrong', async () => {
    const inputs = await helper.generateCancel(helper.tron(0.001), 0x1234, 0, user1, joyso);
    inputs[3] = 111;

   
    const tx1 = await joyso.cancelByAdmin(inputs, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'REVERT');
  });

  it('cancel should fail if user\'s balance is not enough', async () => {
    let inputs = await helper.generateCancel(helper.tron(10), 0x1234, 0, user1, joyso);


    const tx1 = await joyso.cancelByAdmin(inputs, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'REVERT');

    inputs = await helper.generateCancel(helper.tron(10), 0x1234, 1, user2, joyso);
    
    const tx2 = await joyso.cancelByAdmin(inputs, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt2 = await tronWeb.trx.getTransactionInfo(tx2);
    assert.equal(receipt2.receipt.result, 'REVERT');
  
  });

  it('match should fail if the taker order\'s nonce is less than userNonce', async () => {
    let inputs = await helper.generateCancel(helper.tron(0.001), 0x1234, 0, user1, joyso);
    const tx1 = await joyso.cancelByAdmin(inputs, { from: admin });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'SUCCESS');


    inputs = [];
    const order1 = await helper.generateOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000001, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    inputs.push(...order1);

    const order2 = await helper.generateOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000002, 20, 10, 0, false, token.address, ETHER, user2, joyso);
    inputs.push(...order2);

    
    const tx2 = await joyso.matchByAdmin_TwH36(inputs, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt2 = await tronWeb.trx.getTransactionInfo(tx2);
    assert.equal(receipt2.receipt.result, 'REVERT');
  });

  it('match should fail if the maker order\'s nonce is less than userNonce', async () => {
    let inputs = await helper.generateCancel(helper.tron(0.001), 0x1234, 0, user2, joyso);
    const tx1 =  await joyso.cancelByAdmin(inputs, { from: admin });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'SUCCESS');

    inputs = [];
    const order1 = await helper.generateOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000001, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    inputs.push(...order1);

    const order2 = await helper.generateOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000002, 20, 10, 0, false, token.address, ETHER, user2, joyso);
    inputs.push(...order2);

    const tx2 = await joyso.matchByAdmin_TwH36(inputs, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt2 = await tronWeb.trx.getTransactionInfo(tx2);
    assert.equal(receipt2.receipt.result, 'REVERT');
  });

  it('tokenMatch should fail if the taker order\'s nonce is less than userNonce', async () => {
    let inputs = await helper.generateCancel(helper.tron(0.001), 0x1234, 0, user1, joyso);
    const tx1 = await joyso.cancelByAdmin(inputs, { from: admin });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'SUCCESS');

    inputs = [];
    const order1 = await helper.generateTokenOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000001, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    inputs.push(...order1);

    const order2 = await helper.generateTokenOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000002, 20, 10, 0, false, token.address, ETHER, user2, joyso);
    inputs.push(...order2);

    const tx2 = await joyso.matchTokenOrderByAdmin_k44j(inputs, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt2 = await tronWeb.trx.getTransactionInfo(tx2);
    assert.equal(receipt2.receipt.result, 'REVERT');
  });

  it('match should fail if the maker order\'s nonce is less than userNonce', async () => {
    let inputs = await helper.generateCancel(helper.tron(0.001), 0x1234, 0, user2, joyso);
    const tx1 = await joyso.cancelByAdmin(inputs, { from: admin });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'SUCCESS');

    inputs = [];
    const order1 = await helper.generateTokenOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000001, 20, 10, 0, true, ETHER, token.address, user1, joyso);
    inputs.push(...order1);

    const order2 = await helper.generateTokenOrder(helper.tron(0.5), helper.tron(0.5), helper.tron(0.01),
      0x0000002, 20, 10, 0, false, token.address, ETHER, user2, joyso);
    inputs.push(...order2);

    const tx2 = await joyso.matchTokenOrderByAdmin_k44j(inputs, { from: admin, gas: 4700000 });
    await helper.timeout(4000);
    const receipt2 = await tronWeb.trx.getTransactionInfo(tx2);
    assert.equal(receipt2.receipt.result, 'REVERT');
  });
});

'use strict';

const Joyso = artifacts.require('./JoysoMock.sol');
const TestToken = artifacts.require('./testing/TestToken.sol');
const helper = require('./support/helper.js');

contract('Joyso mock', accounts => {
  const user1 = accounts[1];
  const ETHER = '410000000000000000000000000000000000000000';
  let joyso, token;

  beforeEach(async () => {
    const temp = await helper.setupMockEnvironment(accounts);
    joyso = temp[0];
    token = temp[1];
  });

  it('withdraw ether directly by user', async () => {
    await joyso.lockMe({ from: user1 });
    const currentTime = await joyso.time.call();
    const lockPeriod = await joyso.lockPeriod.call();
    await joyso.setTime(currentTime + lockPeriod + 1);
    const user1EtherBalance = await joyso.getBalance.call(ETHER, user1);
    const user1EtherAccountBalance = await tronWeb.trx.getBalance(user1);
    await joyso.withdraw(ETHER, helper.tron(0.5), { from: user1 });
    const user1EtherBalanceAfter = await joyso.getBalance.call(ETHER, user1);
    const user1EtherAccountBalanceAfter = await tronWeb.trx.getBalance(user1);
    assert.equal(user1EtherBalance - user1EtherBalanceAfter, helper.tron(0.5));
    assert.isBelow(user1EtherAccountBalanceAfter - user1EtherAccountBalance, helper.tron(0.5));
    assert.isAbove(user1EtherAccountBalanceAfter - user1EtherAccountBalance, helper.tron(0.45));
  });

  it('withdraw token directly by user', async () => {
    await joyso.lockMe({ from: user1 });
    const currentTime = await joyso.time.call();
    const lockPeriod = await joyso.lockPeriod.call();
    await joyso.setTime(currentTime + lockPeriod + 1);
    const user1EtherAccountBalance = await tronWeb.trx.getBalance(user1);
    const user1TokenBalance = await joyso.getBalance.call(token.address, user1);
    const user1TokenAccountBalance = await token.balanceOf.call(user1);
    await joyso.withdraw(token.address, helper.tron(0.5), { from: user1 });
    const user1EtherAccountBalanceAfter = await tronWeb.trx.getBalance(user1);
    const user1TokenBalanceAfter = await joyso.getBalance.call(token.address, user1);
    const user1TokenAccountBalanceAfter = await token.balanceOf.call(user1);
    assert.equal(user1TokenBalance - user1TokenBalanceAfter, helper.tron(0.5));
    assert.equal(user1TokenAccountBalanceAfter - user1TokenAccountBalance, helper.tron(0.5));
    assert.isBelow(user1EtherAccountBalanceAfter, user1EtherAccountBalance);
    assert.isBelow(user1EtherAccountBalance - user1EtherAccountBalanceAfter, helper.tron(0.1));
  });

  it('unlockMe should reset the user lock', async () => {
    await joyso.lockMe({ from: user1 });
    const currentTime = await joyso.time.call();
    const lockPeriod = await joyso.lockPeriod.call();
    await joyso.setTime(currentTime + lockPeriod / 2 + 1);
    await joyso.unlockMe({ from: user1 });
    await joyso.setTime(currentTime + lockPeriod + 1);
    
    const tx1 =  await joyso.withdraw(token.address, helper.tron(0.5), { from: user1 });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'REVERT');
  });

  it('withdraw ether should fail if no balance', async () => {
    await joyso.lockMe({ from: user1 });
    const currentTime = await joyso.time.call();
    const lockPeriod = await joyso.lockPeriod.call();
    await joyso.setTime(currentTime + lockPeriod + 1);
    
    const tx1 = await joyso.withdraw(ETHER, helper.tron(2), { from: user1 });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'REVERT');
    
  });

  it('withdraw token should fail if no balance', async () => {
    await joyso.lockMe({ from: user1 });
    const currentTime = await joyso.time.call();
    const lockPeriod = await joyso.lockPeriod.call();
    const tx1 = await joyso.setTime(currentTime + lockPeriod + 1);
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx2);
    assert.equal(receipt2.receipt.result, 'SUCCESS');
    
    const tx2 = await joyso.withdraw(token.address, helper.tron(2), { from: user1 });
    await helper.timeout(4000);
    const receipt2 = await tronWeb.trx.getTransactionInfo(tx2);
    assert.equal(receipt2.receipt.result, 'REVERT');  
  });

  it('withdraw directly should fail', async () => {
     
    const tx1 = await joyso.withdraw(ETHER, helper.tron(0.5), { from: user1 });
    await helper.timeout(4000);
    const receipt1 = await tronWeb.trx.getTransactionInfo(tx1);
    assert.equal(receipt1.receipt.result, 'REVERT');  
  });
});

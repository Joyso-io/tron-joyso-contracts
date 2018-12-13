'use strict';

const Joyso = artifacts.require('./Joyso.sol');
const JoysoMock = artifacts.require('./testing/JoysoMock.sol');
const TestToken = artifacts.require('./testing/TestToken.sol');
const TestTokenTwo = artifacts.require('./testing/TestTokenTwo.sol');
const web3Utils = require('web3-utils');
const _ = require('lodash');


const ETHER = '410000000000000000000000000000000000000000';

const privateList = tronWrap._privateKeyByAccount;


function genTokenOrderInputDataWithoutV(nonce, takerFee, makerFee, joyPrice, isBuy, tokenSellId, tokenBuyId, userId) {
  let temp = '0x';
  temp += _.padStart(nonce.toString(16), 8, '0');
  temp += _.padStart(takerFee.toString(16), 4, '0');
  temp += _.padStart(makerFee.toString(16), 4, '0');
  temp += _.padStart('0', 7, '0');
  if (isBuy) {
    temp += _.padStart('1', 1, '0');
  } else {
    temp += _.padStart('0', 1, '0');
  }
  temp += _.padStart(joyPrice.toString(16), 24, '0');
  temp += _.padStart(tokenSellId.toString(16), 4, '0');
  temp += _.padStart(tokenBuyId.toString(16), 4, '0');
  temp += _.padStart(userId.toString(16), 8, '0');
  return temp;
};

function genOrderInputDataWithoutV(nonce, takerFee, makerFee, joyPrice, isBuy, tokenSellId, tokenBuyId, userId) {
  let temp = '0x';
  temp += _.padStart(nonce.toString(16), 8, '0');
  temp += _.padStart(takerFee.toString(16), 4, '0');
  temp += _.padStart(makerFee.toString(16), 4, '0');
  temp += _.padStart(joyPrice.toString(16), 7, '0');
  if (isBuy) {
    temp += _.padStart('1', 1, '0');
  } else {
    temp += _.padStart('0', 1, '0');
  }
  temp += _.padStart('0', 24, '0');
  temp += _.padStart(tokenSellId.toString(16), 4, '0');
  temp += _.padStart(tokenBuyId.toString(16), 4, '0');
  temp += _.padStart(userId.toString(16), 8, '0');
  return temp;
};
function genOrderDataInUserSigned(data, isBuy, tokenAddress) {
  let temp = data.substring(0, 25);
  if (isBuy) {
    temp += '1';
  } else {
    temp += '0';
  }
  temp += tokenAddress.substring(2, 42);
  return temp;
};

function genOrderInputData(dataWithoutV, v) {
  let temp;
  if (v === 27) {
    temp = dataWithoutV;
  } else {
    temp = dataWithoutV.substring(0, 26);
    temp += '1';
    temp += dataWithoutV.substring(27, 66);
  }
  return temp;
};
module.exports = {
    generateCancel: async function (gasFee, nonce, paymentMethod, user, joysoInstance) {
      const array = [];
      const joyso = joysoInstance;
      const userId = await joyso.userAddress2Id.call(user);
      let temp = '0x';
      temp += _.padStart(nonce.toString(16), 8, '0');
      temp += _.padStart('0', 15, '0');
      if (paymentMethod === 1) {
        temp += '1';
      } else if (paymentMethod === 2) {
        temp += '2';
      } else {
        temp += '0';
      }
      temp += _.padStart('0', 40, '0');
      console.log(temp);
      const msg = await web3Utils.soliditySha3(joyso.address.slice(2), gasFee, temp);
      const sigData =await tronWeb.trx.sign(msg,privateList[user]);
      console.log(sigData);
      const sig = sigData.toString().slice(2);
      console.log(sig);
      const r = `0x${sig.slice(0, 64)}`;
      const s = `0x${sig.slice(64, 128)}`;
      const v =  tronWeb.toDecimal(`0x${sig.slice(128, 130)}`);
      console.log(v)
      let temp2 = temp.substring(0, 26);
      if (v === 27) {
        temp2 += '0';
      } else {
        temp2 += '1';
      }
      temp2 += _.padStart('0', 31, '0');
      temp2 += _.padStart(userId.toString(16), 8, '0');
      const dataV = temp2;
      tronWeb
      array[0] = gasFee;
      array[1] = dataV;
      array[2] = r;
      array[3] = s;
      return array;
    },
    generateWithdraw: async function (amount, gasFee, paymentMethod, tokenAddress, userAddress, joysoInstance) {
    const array = [];
    const joyso = joysoInstance;

    // user1 sign the withdraw msg
    /*
        -----------------------------------
        user withdraw singature (uint256)
        (this.address, amount, gasFee, data)
        -----------------------------------
        data [0 .. 7] (uint256) nonce --> does not used when withdraw
        data [23..23] (uint256) paymentMethod --> 0: ether, 1: JOY, 2: token
        data [24..63] (address) tokenAddress
    */
    let data = '0x01234567';
    data += _.padStart('0', 15, '0');
    if (paymentMethod === 1) {
      data += '1';
    } else if (paymentMethod === 2) {
      data += '2';
    } else {
      data += '0';
    }

    const temp = String(tokenAddress).substring(2, 44);
    data += _.padStart(temp, 40, '0');
    const msg = await web3Utils.soliditySha3(joyso.address.slice(2),
      amount,
      gasFee,
      data
    );
    const sigData =await tronWeb.trx.sign(msg,privateList[user]);
    const sig = sigData.toString().slice(2);
    const r = `0x${sig.slice(0, 64)}`;
    const s = `0x${sig.slice(64, 128)}`;
    const v =  tronWeb.toDecimal(`0x${sig.slice(128, 130)}`);

    // withdraw input
    /*
        inputs[0] (uint256) amount;
        inputs[1] (uint256) gasFee;
        inputs[2] (uint256) dataV
        inputs[3] (bytes32) r
        inputs[4] (bytes32) s
        -----------------------------------
        dataV[0 .. 7] (uint256) nonce --> doesnt used when withdraw
        dataV[23..23] (uint256) paymentMethod --> 0: ether, 1: JOY, 2: token
        dataV[24..24] (uint256) v --> 0:27, 1:28 should be uint8 when used
        dataV[52..55] (uint256) tokenId
        dataV[56..63] (uint256) userId
    */

    const tokenId = await joyso.tokenAddress2Id.call(tokenAddress);
    const userId = await joyso.userAddress2Id.call(userAddress);

    let temp2 = data.substring(0, 26);
    if (v === 27) {
      temp2 += '0';
    } else {
      temp2 += '1';
    }
    temp2 += _.padStart('0', 27, '0');
    temp2 += _.padStart(tokenId.toString(16), 4, '0');
    temp2 += _.padStart(userId.toString(16), 8, '0');
    const dataV = temp2;

    array[0] = amount;
    array[1] = gasFee;
    array[2] = dataV;
    array[3] = r;
    array[4] = s;
    return array;
  },

  generateMigrate: async function (gasFee, paymentMethod, tokenAddress, userAddress, joysoInstance, newContractAddress) {
    const array = [];
    const joyso = joysoInstance;

    // user1 sign the migrate msg
    /*
        -----------------------------------
        user migrate singature (uint256)
        (this.address, newAddress, gasFee, data)
        -----------------------------------
        data [0 .. 7] (uint256) nonce --> does not used when migrate
        data [23..23] (uint256) paymentMethod --> 0: ether, 1: JOY, 2: token
        data [24..63] (address) tokenAddress
    */
    let data = '0x01234567';
    data += _.padStart('0', 15, '0');
    if (paymentMethod === 1) {
      data += '1';
    } else if (paymentMethod === 2) {
      data += '2';
    } else {
      data += '0';
    }

    const temp = String(tokenAddress).substring(2, 44);
    data += _.padStart(temp, 40, '0');
    const msg = await web3Utils.soliditySha3(joyso.address.slice(2),
      gasFee,
      data,
      newContractAddress
    );
    const sigData =await tronWeb.trx.sign(msg,privateList[userAddress]);
    const sig = sigData.toString().slice(2);
    const r = `0x${sig.slice(0, 64)}`;
    const s = `0x${sig.slice(64, 128)}`;
    const v =  tronWeb.toDecimal(`0x${sig.slice(128, 130)}`);

    // withdraw input
    /*
        inputs[0] (uint256) amount;
        inputs[1] (uint256) gasFee;
        inputs[2] (uint256) dataV
        inputs[3] (bytes32) r
        inputs[4] (bytes32) s
        -----------------------------------
        dataV[0 .. 7] (uint256) nonce --> doesnt used when migrate
        dataV[23..23] (uint256) paymentMethod --> 0: ether, 1: JOY, 2: token
        dataV[24..24] (uint256) v --> 0:27, 1:28 should be uint8 when used
        dataV[52..55] (uint256) tokenId
        dataV[56..63] (uint256) userId
    */
    const tokenId = await joyso.tokenAddress2Id.call(tokenAddress);
    const userId = await joyso.userAddress2Id.call(userAddress);

    let temp2 = data.substring(0, 26);
    if (v === 27) {
      temp2 += '0';
    } else {
      temp2 += '1';
    }
    temp2 += _.padStart('0', 27, '0');
    temp2 += _.padStart(tokenId.toString(16), 4, '0');
    temp2 += _.padStart(userId.toString(16), 8, '0');
    const dataV = temp2;

    array[0] = gasFee;
    array[1] = dataV;
    array[2] = r;
    array[3] = s;
    return array;
  },
  generateOrder: async function (amountSell, amountBuy, gasFee, nonce, takerFee, makerFee,
    joyPrice, isBuy, tokenSell, tokenBuy, user, joysoInstance) {
    const array = [];
    const joyso = joysoInstance;
    const tokenSellId = await joyso.tokenAddress2Id.call(tokenSell);
    const tokenBuyId = await joyso.tokenAddress2Id.call(tokenBuy);
    console.log("sellId:"+web3Utils.toHex(tokenSellId).slice(2));
    console.log("buyid:"+web3Utils.toHex(tokenBuyId).slice(2))
    let token = tokenSell;
    if (isBuy) {
      token = tokenBuy;
    }
    const userId = await joyso.userAddress2Id.call(user);
    const inputDataWithoutV = genOrderInputDataWithoutV(nonce, takerFee, makerFee, joyPrice, 0,
      web3Utils.toHex(tokenSellId).slice(2), web3Utils.toHex(tokenBuyId).slice(2), userId);
    const letUserSignData = genOrderDataInUserSigned(inputDataWithoutV, isBuy, token);
    console.log("joyso:"+joyso.address);
    //const testShift = await joyso.testUpdateUserBalance();
    const userShouldSignIt = await web3Utils.soliditySha3(joyso.address.slice(2),
      amountSell,
       amountBuy,
       gasFee,
       letUserSignData
    );
    console.log("userData:" +letUserSignData );
    console.log("hash local:"+userShouldSignIt);
    const sigData =await tronWeb.trx.sign(userShouldSignIt,privateList[user]);
    const sig = sigData.toString().slice(2);
    const r = `0x${sig.slice(0, 64)}`;
    const s = `0x${sig.slice(64, 128)}`;
    const v =  tronWeb.toDecimal(`0x${sig.slice(128, 130)}`);
    const inputData = genOrderInputData(inputDataWithoutV, v);
    
    const tt = await joyso.decodeOrderTokenAndIsBuy(inputData);
    console.log(tt);
    array[0] = amountSell;
    array[1] = amountBuy;
    array[2] = gasFee;
    array[3] = inputData;
    array[4] = r;
    array[5] = s;
    return array;
    
  },
  timeout :function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
  },
  generateTokenOrder: async function (amountSell, amountBuy, gasFee, nonce, takerFee, makerFee,
    joyPrice, isBuy, tokenSell, tokenBuy, user, joysoInstance) {
    const array = [];
    const joyso = joysoInstance;
    const tokenSellId = await joyso.tokenAddress2Id.call(tokenSell);
    const tokenBuyId = await joyso.tokenAddress2Id.call(tokenBuy);
    const userId = await joyso.userAddress2Id.call(user);
    let token = tokenSell;
    let baseToken = tokenBuy;
    if (isBuy) {
      token = tokenBuy;
      baseToken = tokenSell;
    }
    const inputDataWithoutV = genTokenOrderInputDataWithoutV(nonce, takerFee, makerFee, joyPrice, isBuy,
      web3Utils.toHex(tokenSellId).slice(2), web3Utils.toHex(tokenBuyId).slice(2), userId);
    const letUserSignData = genOrderDataInUserSigned(inputDataWithoutV, isBuy, token);
    console.log("B:"+baseToken);
    const userShouldSignIt = await web3Utils.soliditySha3(joyso.address.slice(2),
      amountSell,
      amountBuy,
      gasFee,
      letUserSignData,
       baseToken.slice(2),
      joyPrice);
    const sigData =await tronWeb.trx.sign(userShouldSignIt,privateList[user]);
    const sig = sigData.toString().slice(2);
    console.log("userData:" +letUserSignData );
    console.log("hash local:"+userShouldSignIt);
    const r = `0x${sig.slice(0, 64)}`;
    const s = `0x${sig.slice(64, 128)}`;
    const v = tronWeb.toDecimal(`0x${sig.slice(128, 130)}`);
    const inputData = genOrderInputData(inputDataWithoutV, v);
    array[0] = amountSell;
    array[1] = amountBuy;
    array[2] = gasFee;
    array[3] = inputData;
    array[4] = r;
    array[5] = s;
    return array;
  },
  setupEnvironment: async function (accounts) {

    const admin = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const user3 = accounts[3];
    const joysoWallet = accounts[4];
    const joy = await TestToken.deployed();
    const joyso = await Joyso.deployed();
    const token = await TestTokenTwo.deployed();
    await joyso.registerToken(token.address, 0x57, { from: admin });
    await token.transfer(user1, this.tron(1), { from: admin });
    await token.transfer(user2, this.tron(1), { from: admin });
    await token.transfer(user3, this.tron(1), { from: admin });
    await joy.transfer(user1, this.tron(1), { from: admin });
    await joy.transfer(user2, this.tron(1), { from: admin });
    await joy.transfer(user3, this.tron(1), { from: admin });
    await token.approve(joyso.address, this.tron(1), { from: user1 });
    await token.approve(joyso.address, this.tron(1), { from: user2 });
    await token.approve(joyso.address, this.tron(1), { from: user3 });
    await joy.approve(joyso.address, this.tron(1), { from: user1 });
    await joy.approve(joyso.address, this.tron(1), { from: user2 });
    await joy.approve(joyso.address, this.tron(1), { from: user3 });
    await joyso.depositEther({ from: user1, callValue: this.tron(1) });
    await joyso.depositEther({ from: user2, callValue: this.tron(1) });
    await joyso.depositEther({ from: user3, callValue: this.tron(1) });
    await joyso.depositToken(token.address, this.tron(1), { from: user1 });
    await joyso.depositToken(token.address, this.tron(1), { from: user2 });
    await joyso.depositToken(token.address, this.tron(1), { from: user3 });
    await joyso.depositToken(joy.address, this.tron(1), { from: user1 });
    await joyso.depositToken(joy.address, this.tron(1), { from: user2 });
    await joyso.depositToken(joy.address, this.tron(1), { from: user3 });
    const array = [];
    array[0] = joyso;
    array[1] = token;
    array[2] = joy;
    return array;
  },
  tron: function (amount) {
    //console.log("sun:"+tronWeb.toSun(amount))
    return Number(Number(tronWeb.toSun(amount)).toFixed(0));
  },
  setupMockEnvironment: async function (accounts) {
    const admin = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const user3 = accounts[3];

    const joy = await TestToken.deployed();
    const joyso = await JoysoMock.deployed();
    const token = await TestTokenTwo.deployed();
    await joyso.registerToken(token.address, 0x57, { from: admin });
    await token.transfer(user1, this.tron(1), { from: admin });
    await token.transfer(user2, this.tron(1), { from: admin });
    await token.transfer(user3, this.tron(1), { from: admin });
    await joy.transfer(user1, this.tron(1), { from: admin });
    await joy.transfer(user2, this.tron(1), { from: admin });
    await joy.transfer(user3, this.tron(1), { from: admin });
    await token.approve(joyso.address, this.tron(1), { from: user1 });
    await token.approve(joyso.address, this.tron(1), { from: user2 });
    await token.approve(joyso.address, this.tron(1), { from: user3 });
    await joy.approve(joyso.address, this.tron(1), { from: user1 });
    await joy.approve(joyso.address, this.tron(1), { from: user2 });
    await joy.approve(joyso.address, this.tron(1), { from: user3 });
    await joyso.depositEther({ from: user1, callValue: this.tron(1) });
    await joyso.depositEther({ from: user2, callValue: this.tron(1) });
    await joyso.depositEther({ from: user3, callValue: this.tron(1) });
    await joyso.depositToken(token.address, this.tron(1), { from: user1 });
    await joyso.depositToken(token.address, this.tron(1), { from: user2 });
    await joyso.depositToken(token.address, this.tron(1), { from: user3 });
    await joyso.depositToken(joy.address, this.tron(1), { from: user1 });
    await joyso.depositToken(joy.address, this.tron(1), { from: user2 });
    await joyso.depositToken(joy.address, this.tron(1), { from: user3 });
    const array = [];
    array[0] = joyso;
    array[1] = token;
    array[2] = joy;
    return array;
  },

  setupEnvironment2: async function (accounts) {
    const admin = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const user3 = accounts[3];

    const joy = await TestToken.deployed();
    const joyso = await Joyso.deployed();
    const token = await TestTokenTwo.deployed();
    await joyso.registerToken(token.address, 0x57, { from: admin });
    await token.transfer(user1, this.tron(1), { from: admin });
    await token.transfer(user2, this.tron(1), { from: admin });
    await token.transfer(user3, this.tron(1), { from: admin });
    await joy.transfer(user1, this.tron(1), { from: admin });
    await joy.transfer(user2, this.tron(1), { from: admin });
    await joy.transfer(user3, this.tron(1), { from: admin });
    await token.approve(joyso.address, this.tron(1), { from: user1 });
    await token.approve(joyso.address, this.tron(1), { from: user2 });
    await token.approve(joyso.address, this.tron(1), { from: user3 });
    await joy.approve(joyso.address, this.tron(1), { from: user1 });
    await joy.approve(joyso.address, this.tron(1), { from: user2 });
    await joy.approve(joyso.address, this.tron(1), { from: user3 });
    await joyso.depositEther({ from: user2, callValue: 100000000000000000 });
    await joyso.depositToken(token.address, 200000000, { from: user1 });
    await joyso.depositToken(joy.address, 1000000000, { from: user1 });
    const array = [];
    array[0] = joyso;
    array[1] = token;
    array[2] = joy;
    return array;
  },
}
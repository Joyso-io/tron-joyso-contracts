
const Joyso = artifacts.require('./Joyso.sol');
const TestToken = artifacts.require('./testing/TestToken.sol');
let instance;
module.exports =function(deployer) {
    deployer.deploy(TestToken,'tt','tt',18)
    deployer.deploy(TestToken,'tt','tt',18).then(function(data){
       return deployer.deploy(Joyso,'TQXmAS5hKgiz6QUCv62qFv1odeKxtxZmTy',data.address);
    });

};

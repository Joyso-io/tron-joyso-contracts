pragma solidity 0.4.24;
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract JoysoInterFace {
    function registerToken(address tokenAddress, uint256 index) external;
    mapping (address => uint256) public tokenAddress2Id;
    mapping (uint256 => address) public tokenId2Address;
}

contract TokenRegister is Ownable{
        
    JoysoInterFace joyso;

    function setJoysoContractAddress(address _address) external onlyOwner{
        joyso = JoysoInterFace(_address);
    }

    function bulkRegister(address[] token, uint256 id) external onlyOwner{
        uint256 length = token.length;


        for (uint256 i = 0; i < length; i++) {
            address temp = token[i];
            uint256 index = id + i;
            if(joyso.tokenAddress2Id(temp) != 0) {
                break;
            }
            if(joyso.tokenId2Address(index) != 0) {
                break;
            }
            joyso.registerToken(token[i], index);
        }
    }
}

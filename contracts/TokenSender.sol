pragma solidity ^0.4.19;
import 'zeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract JoysoInterFace {
    function transferForAdmin(address token, address account, uint256 amount) external;
    function depositToken(address token, uint256 amount) external;
}

contract TokenSender is Ownable {
    mapping (uint256 => bool) public transfered;
    mapping (address => bool) public isAdmin;

    JoysoInterFace joyso;

    modifier onlyAdmin() {
        require(isAdmin[msg.sender] || msg.sender == owner, "admin only");
        _;
    }

    function addToAdmin(address user, bool _isAdmin) external onlyOwner {
        isAdmin[user] = _isAdmin;
    }

    function setJoysoContractAddress(address _address) external onlyOwner {
        joyso = JoysoInterFace(_address);
    }

    function tokenApprove(address token) external {
        require(joyso != address(0), "joyso not set");
        if (ERC20(token).allowance(this, address(joyso)) > 0) {
            require(ERC20(token).approve(address(joyso), 0), "failed to re-approve joyso");
        }
        require(ERC20(token).approve(address(joyso), uint256(-1)), "failed to approve joyso");
    }

    function wBulkTransfer(uint256 transferId, address[] receivers, uint256[] amounts, address token) external onlyAdmin {
        require(!transfered[transferId], "transfered");
        uint256 totals = 0;
        uint256 length = receivers.length;
        for (uint256 i = 0; i < length; i++) {
            totals += amounts[i];
        }
        require(ERC20(token).transferFrom(msg.sender, this, totals), "failed to transferFrom");
        joyso.depositToken(token, totals);
        for (i = 0; i < length; i++) {
            joyso.transferForAdmin(token, receivers[i], amounts[i]);
        }
        transfered[transferId] = true;
    }

    function hBulkTransfer(address[] receivers, uint256[] amounts, address token) external onlyAdmin {
        uint256 totals = 0;
        uint256 length = receivers.length;
        for (uint256 i = 0; i < length; i++) {
            totals += amounts[i];
        }
        require(ERC20(token).transferFrom(msg.sender, this, totals), "failed to transferFrom");
        joyso.depositToken(token, totals);
        for (i = 0; i < length; i++) {
            joyso.transferForAdmin(token, receivers[i], amounts[i]);
        }
    }
}

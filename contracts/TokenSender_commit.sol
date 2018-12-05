pragma solidity ^0.4.19;

/**
 * @title ERC20Basic
 * @dev Simpler version of ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/179
 */
contract ERC20Basic {
  function totalSupply() public view returns (uint256);
  function balanceOf(address who) public view returns (uint256);
  function transfer(address to, uint256 value) public returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
}

/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20 is ERC20Basic {
  function allowance(address owner, address spender)
    public view returns (uint256);

  function transferFrom(address from, address to, uint256 value)
    public returns (bool);

  function approve(address spender, uint256 value) public returns (bool);
  event Approval(
    address indexed owner,
    address indexed spender,
    uint256 value
  );
}

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;


  event OwnershipRenounced(address indexed previousOwner);
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() public {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Allows the current owner to relinquish control of the contract.
   */
  function renounceOwnership() public onlyOwner {
    emit OwnershipRenounced(owner);
    owner = address(0);
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function transferOwnership(address _newOwner) public onlyOwner {
    _transferOwnership(_newOwner);
  }

  /**
   * @dev Transfers control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function _transferOwnership(address _newOwner) internal {
    require(_newOwner != address(0));
    emit OwnershipTransferred(owner, _newOwner);
    owner = _newOwner;
  }
}
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

// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.9;

contract Bank {
    mapping (address => uint) _balances;

    function deposite(uint _amount) public {
        require(msg.sender != address(0), "You cannot deposit for the address zero");
        _balances[msg.sender] += _amount;
    }

    function trasfert(address _recipient, uint _amount) public {
        require(_recipient != address(0), "You cannot transert to the address zero");
        require(_balances[msg.sender] >= _amount, "You have not enough balance");
        _balances[msg.sender] -= _amount;
        _balances[_recipient] += _amount;
    }

    function balanceOf(address _address) public view returns(uint) {
        return _balances[_address];
    }
}
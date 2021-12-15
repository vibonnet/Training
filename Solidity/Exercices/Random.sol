// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.9;

contract Random {
    uint private nonce = 0;

    function random() public returns(uint) {
        nonce++;
        return uint(keccak256(abi.encode(block.timestamp, msg.sender, nonce))) %100;
    }
}
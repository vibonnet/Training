// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9;

contract SimpleStorage {
    uint256 data; //Cette variable est intialisé avec une valeure précise

    function get() public view returns (uint256) {
        return data;
    }
}

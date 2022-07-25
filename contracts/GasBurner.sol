// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

contract GasBurner {
    uint256 number;
    function consume(uint256 num) public {
        for (uint256 i=0; i<num; i++) {
            number += i;
        }
    }
}

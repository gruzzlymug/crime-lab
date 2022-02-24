//SPDX-License-Identifier: MIT

// This code was taken from: https://polygonscan.com/address/0xcd7361ac3307d1c5a46b63086a90742ff44c63b3#code

pragma solidity ^0.8.0;

import './RaiderToken_ERC20.sol';

contract RaiderToken is ERC20 {
  // Mint the Raider token with a supply of 100,000,000
  constructor() ERC20('RaiderToken', 'RAIDER') {
    _mint(msg.sender, 100000000 * (10**uint256(decimals())));
  }
}

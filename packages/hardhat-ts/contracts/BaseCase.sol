// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract BaseCase {
  event CardDealt(uint256 card, address player);
  event CardDiscarded(uint256 card, address player);

  uint256 constant INVALID = 0;
  // suspects
  uint256 constant MUSTARD = 1;
  uint256 constant SCARLET = 2;
  uint256 constant PLUM = 3;
  uint256 constant GREEN = 4;
  uint256 constant WHITE = 5;
  uint256 constant PEACOCK = 6;
  // weapons
  uint256 constant ROPE = 7;
  uint256 constant PIPE = 8;
  uint256 constant KNIFE = 9;
  uint256 constant WRENCH = 10;
  uint256 constant CANDLESTICK = 11;
  uint256 constant REVOLVER = 12;
  // rooms
  uint256 constant BILLIARD = 13;
  uint256 constant STUDY = 14;
  uint256 constant HALL = 15;
  uint256 constant LOUNGE = 16;
  uint256 constant DINING = 17;
  uint256 constant BALLROOM = 18;
  uint256 constant CONSERVATORY = 19;
  uint256 constant LIBRARY = 20;
  uint256 constant KITCHEN = 21;

  uint256[] deck = [
    // suspects
    MUSTARD, SCARLET, PLUM, GREEN, WHITE, PEACOCK,
    // weapons
    ROPE, PIPE, KNIFE, WRENCH, CANDLESTICK, REVOLVER,
    // rooms
    BILLIARD, STUDY, HALL, LOUNGE, DINING, BALLROOM,
    CONSERVATORY, LIBRARY, KITCHEN
  ];
}

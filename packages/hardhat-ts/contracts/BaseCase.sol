// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract BaseCase {
  event CardDealt(uint card, address player);
  event CardDiscarded(uint card, address player);

  uint constant INVALID = 0;
  // suspects
  uint constant MUSTARD = 1;
  uint constant SCARLET = 2;
  uint constant PLUM = 3;
  uint constant GREEN = 4;
  uint constant WHITE = 5;
  uint constant PEACOCK = 6;
  // weapons
  uint constant ROPE = 7;
  uint constant PIPE = 8;
  uint constant KNIFE = 9;
  uint constant WRENCH = 10;
  uint constant CANDLESTICK = 11;
  uint constant REVOLVER = 12;
  // rooms
  uint constant BILLIARD = 13;
  uint constant STUDY = 14;
  uint constant HALL = 15;
  uint constant LOUNGE = 16;
  uint constant DINING = 17;
  uint constant BALLROOM = 18;
  uint constant CONSERVATORY = 19;
  uint constant LIBRARY = 20;
  uint constant KITCHEN = 21;

  uint[] deck = [
    // suspects
    MUSTARD, SCARLET, PLUM, GREEN, WHITE, PEACOCK,
    // weapons
    ROPE, PIPE, KNIFE, WRENCH, CANDLESTICK, REVOLVER,
    // rooms
    BILLIARD, STUDY, HALL, LOUNGE, DINING, BALLROOM,
    CONSERVATORY, LIBRARY, KITCHEN
  ];
}

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract GameBoard {
  struct Room {
    uint256 x;
    uint256 y;
    uint256 width;
    uint256 height;
    string name;
  }

  string public name;
  Room[] public rooms;

  uint256 constant rows = 25;
  uint256 constant cols = 24;

  constructor(string memory _name) {
    name = _name;
  }

  function addRoom(Room memory _room) public {
    rooms.push(_room);
  }

  // NOTE currently unused
  function getDimensions() public pure returns (uint256, uint256) {
    return (cols, rows);
  }

  function getMap() public view returns (uint256[] memory) {
    uint256 count = rows * cols;
    uint256[] memory map = new uint256[](count);
    for (uint256 i = 0; i < rooms.length; ++i) {
      uint256 cellId = rooms[i].y * cols + rooms[i].x;
      for (uint256 j = 0; j < rooms[i].height; ++j) {
        for (uint256 k = 0; k < rooms[i].width; ++k) {
          map[cellId + j * cols + k] = 2;
        }
      }
    }

    // add walls around the edge
    // for (uint256 r = 0; r < rows; ++r) {
    //   uint256 cellId = r * rows;
    //   map[cellId] = 1;
    //   map[cellId + cols - 1] = 1;
    // }
    // for (uint256 c = 2; c < cols - 2; ++c) {
    //   map[c] = 1;
    //   map[c + (cols * (rows - 1))] = 1;
    // }

    return map;
  }

  // NOTE currently unused
  function _convertXy(uint256 x, uint256 y) internal pure returns (uint256) {
    return y * 22 + x;
  }
}

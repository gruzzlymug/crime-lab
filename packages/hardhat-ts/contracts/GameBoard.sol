// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// NOTE
// Consider storing a board as an N by M matrix of uint256
// values only. Any operation will modify this map instead
// of storing info to create the map on demand. In other words,
// move logic from getMap to addRoom, etc.
contract GameBoard {
  struct Room {
    uint256 x;
    uint256 y;
    uint256 width;
    uint256 height;
    uint256[4] doors;
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
      // floorplan
      uint256 cellId = rooms[i].y * cols + rooms[i].x;
      for (uint256 j = 0; j < rooms[i].height; ++j) {
        for (uint256 k = 0; k < rooms[i].width; ++k) {
          map[cellId + j * cols + k] = 2;
        }
      }
      // doors
      for (uint256 j = 0; j < 4; ++j) {
        uint256 door = rooms[i].doors[j];
        if (door != 65535) {
          uint256 doorX = door % rooms[i].width;
          uint256 doorY = door / rooms[i].width;
          map[cellId + doorY * cols + doorX] = 3;
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

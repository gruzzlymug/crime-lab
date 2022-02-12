// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// NOTE for debugging only
import 'hardhat/console.sol';

// NOTE
// Consider storing a board as an N by M matrix of uint256
// values only. Any operation will modify this map instead
// of storing info to create the map on demand. In other words,
// move logic from getMap to addRoom, addStarts, etc.
// Functions could take arbitrarily long arrays.
contract GameBoard {
  struct Room {
    uint256 id;
    uint256 x;
    uint256 y;
    uint256 width;
    uint256 height;
    uint256[4] doors;
  }

  // NOTE ¡magic number!
  uint256 constant NV = 65535;

  uint256 public constant CELL_ROOM = 2;
  uint256 public constant CELL_DOOR = 3;
  uint256 public constant CELL_START = 4;

  string name;
  uint256[8] starts;
  Room[] rooms;

  uint256 constant rows = 25;
  uint256 constant cols = 24;

  constructor(string memory _name) {
    name = _name;
  }

  function addStarts(uint256[8] memory _starts) public {
    starts = _starts;
  }

  function getStarts() public view returns (uint256[8] memory) {
    return starts;
  }

  function addRoom(Room memory _room) public {
    rooms.push(_room);
  }

  // NOTE currently unused
  function getDimensions() public pure returns (uint256, uint256) {
    return (cols, rows);
  }

  // TODO document bit field here
  function getMap() public view returns (uint256[] memory) {
    uint256 count = rows * cols;
    uint256[] memory map = new uint256[](count);
    // starts
    for (uint256 i = 0; i < starts.length; ++i) {
      uint256 cellId = starts[i];
      if (cellId != NV) {
        map[cellId] = CELL_START;
      }
    }
    // rooms
    for (uint256 i = 0; i < rooms.length; ++i) {
      // encode room id
      require(rooms[i].id < 16, 'Room ID too large to encode');
      uint256 encodedRoomId = rooms[i].id << 4;
      // floorplan
      uint256 cellId = rooms[i].y * cols + rooms[i].x;
      for (uint256 j = 0; j < rooms[i].height; ++j) {
        for (uint256 k = 0; k < rooms[i].width; ++k) {
          map[cellId + j * cols + k] = encodedRoomId | CELL_ROOM;
        }
      }
      // doors
      for (uint256 j = 0; j < 4; ++j) {
        uint256 door = rooms[i].doors[j];
        if (door != NV) {
          uint256 doorX = door % rooms[i].width;
          uint256 doorY = door / rooms[i].width;
          map[cellId + doorY * cols + doorX] = encodedRoomId | CELL_DOOR;
        }
      }
    }

    return map;
  }

  // NOTE currently unused
  function _convertXy(uint256 x, uint256 y) internal pure returns (uint256) {
    return y * 22 + x;
  }
}

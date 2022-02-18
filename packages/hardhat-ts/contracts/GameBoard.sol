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
    uint256[2] passage;
  }

  // NOTE ¡magic number!
  uint256 constant NV = 65535;

  uint256 public constant CELL_CORRIDOR = 0;
  uint256 public constant CELL_WALL = 1; // for obstructions
  uint256 public constant CELL_ROOM = 2;
  uint256 public constant CELL_DOOR = 3;
  uint256 public constant CELL_START = 4;
  uint256 public constant CELL_PASSAGE = 5;
  uint256 public constant CELL_QUEUED = 6;

  string name;
  uint256[8] starts;
  Room[] rooms;

  uint256 constant rows = 25;
  uint256 constant cols = 24;

  constructor(string memory _name) {
    name = _name;
    // TODO initialize starts to NO_VALUE
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
      // passages
      uint256 passage = rooms[i].passage[0];
      if (passage != NV) {
        uint256 passageX = passage % rooms[i].width;
        uint256 passageY = passage / rooms[i].width;
        uint256 encodedTargetId = rooms[i].passage[1] << 8;
        map[cellId + passageY * cols + passageX] = encodedTargetId | encodedRoomId | CELL_PASSAGE;
      }
    }

    return map;
  }

  function isValidMove(
    uint256 _start,
    uint256 _end,
    uint256[4] memory _obstructions
  ) public view returns (bool) {
    uint256 numCells = rows * cols;
    if (_start >= numCells || _end >= numCells) {
      return false;
    }
    if (_start == _end) {
      return false;
    }

    uint256[] memory map = getMap();
    // ensure end location is walkable, start assumed to be OK
    if (!_isWalkable(map[_end])) {
      return false;
    }
    // add obstructions
    for (uint256 i = 0; i < 4; ++i) {
      if (_obstructions[i] != NV) {
        map[_obstructions[i]] = CELL_WALL;
      }
    }

    // flood fill for initial implementation
    bool isValid = false;
    uint256[] memory queue = new uint256[](numCells);
    uint256 rp = 0;
    uint256 wp = 0;
    queue[wp++] = _start;
    uint256 numSeeks = 0;
    while (rp < wp) {
      if (numSeeks >= numCells) {
        return false;
      }
      ++numSeeks;

      uint256 pos = queue[rp++];
      if (pos < numCells) {
        if (pos == _end) {
          isValid = true;
          break;
        } else {
          // check adjacent cells
          uint256 y = pos / cols;
          uint256 x = pos % cols;

          if (x > 0) {
            uint256 left = _convertXy(x - 1, y);
            if (_isWalkable(map[left])) {
              queue[wp++] = left;
              map[left] = CELL_QUEUED;
            }
          }
          if (x < cols) {
            uint256 right = _convertXy(x + 1, y);
            if (_isWalkable(map[right])) {
              queue[wp++] = right;
              map[right] = CELL_QUEUED;
            }
          }
          if (y > 0) {
            uint256 up = _convertXy(x, y - 1);
            if (_isWalkable(map[up])) {
              queue[wp++] = up;
              map[up] = CELL_QUEUED;
            }
          }
          if (y < rows) {
            uint256 down = _convertXy(x, y + 1);
            if (_isWalkable(map[down])) {
              queue[wp++] = down;
              map[down] = CELL_QUEUED;
            }
          }
        }
      }
    }
    return isValid;
  }

  function _isWalkable(uint256 _terrain) internal pure returns (bool) {
    // strip everything but the cell type
    _terrain &= 0x0f;
    if (_terrain == CELL_CORRIDOR || _terrain == CELL_DOOR) {
      return true;
    }
    return false;
  }

  function _convertXy(uint256 x, uint256 y) internal pure returns (uint256) {
    return y * cols + x;
  }
}

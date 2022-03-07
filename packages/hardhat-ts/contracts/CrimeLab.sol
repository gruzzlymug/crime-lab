// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './BaseCase.sol';
import './GameBoard.sol';
import 'hardhat/console.sol';

contract CrimeLab is BaseCase {
  event GameCreated(uint256 gameId, string name, address creator);
  event PlayerJoined(uint256 gameId, address player);
  event DieRolled(uint256 gameId, address player, uint256 roll);
  event SuggestionMade(uint256 gameId, address player);
  event SuggestionData(uint256 gameId, uint256 suspect, uint256 weapon, uint256 room);
  event AccusationMade(uint256 gameId, address player);
  event AccusationData(uint256 gameId, uint256 suspect, uint256 weapon, uint256 room);
  event PlayerMoved(uint256 gameId, address player);
  event TurnTaken(uint256 gameId);

  // When a uint is not meant to be set to anything, use this
  uint256 constant NO_VALUE = 65535;
  // TODO ¡replace hard-coded (& shared with GameBoard) magic number!
  uint256 constant NV = 65535;

  struct Player {
    address id;
    bool ready;
    uint256 position;
  }

  struct Crime {
    uint256 suspect;
    uint256 weapon;
    uint256 room;
  }

  struct Game {
    string name;
    Crime crime;
    uint256 turn;
    uint256 lastDieRoll;
    bool moved;
  }

  mapping(uint256 => Player[]) public game_to_players;
  mapping(address => uint256) public player_to_game;
  mapping(address => uint256[]) public player_to_cards;

  Game[] public games;
  // TODO maybe make this part of the game
  uint256 prngSeed = block.timestamp;

  GameBoard gameBoard;

  constructor() {
    // HACK create INVALID game as fake null
    Crime memory crime = Crime(INVALID, INVALID, INVALID);
    uint256 turn = 0;
    uint256 lastDieRoll = 0;
    bool moved = false;
    games.push(Game('** INVALID **', crime, turn, lastDieRoll, moved));

    createBoard();
  }

  // Room format: id, x pos, y pos, width, height, [doors]
  function createBoard() internal {
    gameBoard = new GameBoard('Default Board');

    gameBoard.addStarts([uint256(16), 120, 191, 432, 585, 590, NV, NV]);

    // TODO these ids need to be shared better
    // TODO get rid of hard-coded 13 / fix width of ID field. see also isInRoom()
    uint256 BILLIARD = 13 - 13;
    uint256 STUDY = 14 - 13;
    uint256 HALL = 15 - 13;
    uint256 LOUNGE = 16 - 13;
    uint256 DINING = 17 - 13;
    uint256 BALLROOM = 18 - 13;
    uint256 CONSERVATORY = 19 - 13;
    uint256 LIBRARY = 20 - 13;
    uint256 KITCHEN = 21 - 13;

    // study
    gameBoard.addRoom(GameBoard.Room(STUDY, 0, 0, 6, 1, [NV, NV, NV, NV], [NV, NV]));
    gameBoard.addRoom(GameBoard.Room(STUDY, 0, 1, 7, 3, [20, NV, NV, NV], [uint256(14), 8]));

    // library
    gameBoard.addRoom(GameBoard.Room(LIBRARY, 1, 6, 5, 1, [NV, NV, NV, NV], [NV, NV]));
    gameBoard.addRoom(GameBoard.Room(LIBRARY, 0, 7, 7, 3, [13, NV, NV, NV], [NV, NV]));
    gameBoard.addRoom(GameBoard.Room(LIBRARY, 1, 10, 5, 1, [2, NV, NV, NV], [NV, NV]));

    // billiard
    gameBoard.addRoom(GameBoard.Room(BILLIARD, 0, 12, 6, 5, [1, 23, NV, NV], [NV, NV]));

    // conservatory
    gameBoard.addRoom(GameBoard.Room(CONSERVATORY, 1, 19, 4, 1, [3, NV, NV, NV], [uint256(0), 6]));
    gameBoard.addRoom(GameBoard.Room(CONSERVATORY, 0, 20, 6, 4, [NV, NV, NV, NV], [NV, NV]));

    // hall
    gameBoard.addRoom(GameBoard.Room(HALL, 9, 0, 6, 7, [24, 38, 39, NV], [NV, NV]));

    // ballroom
    gameBoard.addRoom(GameBoard.Room(BALLROOM, 8, 17, 8, 6, [uint256(1), 6, 16, 23], [NV, NV]));
    gameBoard.addRoom(GameBoard.Room(BALLROOM, 10, 23, 4, 2, [NV, NV, NV, NV], [NV, NV]));

    // lounge
    gameBoard.addRoom(GameBoard.Room(LOUNGE, 18, 0, 6, 1, [NV, NV, NV, NV], [NV, NV]));
    gameBoard.addRoom(GameBoard.Room(LOUNGE, 17, 1, 7, 5, [28, NV, NV, NV], [uint256(34), 3]));

    // dining room
    gameBoard.addRoom(GameBoard.Room(DINING, 16, 9, 8, 6, [1, 24, NV, NV], [NV, NV]));
    gameBoard.addRoom(GameBoard.Room(DINING, 19, 15, 5, 1, [NV, NV, NV, NV], [NV, NV]));

    // kitchen
    gameBoard.addRoom(GameBoard.Room(KITCHEN, 18, 18, 5, 1, [1, NV, NV, NV], [NV, NV]));
    gameBoard.addRoom(GameBoard.Room(KITCHEN, 18, 19, 6, 5, [NV, NV, NV, NV], [uint256(24), 0]));
  }

  function getName(uint256 _gameId) external view returns (string memory) {
    return games[_gameId].name;
  }

  function getMap() external view returns (uint256[] memory) {
    uint256[] memory map = gameBoard.getMap();

    // add players to map
    uint256 gameIndex = player_to_game[msg.sender];
    uint256 numPlayers = getNumPlayers(gameIndex);
    for (uint256 i = 0; i < numPlayers; ++i) {
      uint256 pos = game_to_players[gameIndex][i].position;
      // TODO ¡magic number alert! 'shared' with frontend
      if (pos != NO_VALUE) {
        // combine type and id
        map[pos] += ((i << 4) | 1) << 32;
      }
    }

    return map;
  }

  function getGameId() public view returns (uint256) {
    return player_to_game[msg.sender];
  }

  function getNumPlayers(uint256 _gameId) public view returns (uint256) {
    uint256 numPlayers = uint256(game_to_players[_gameId].length);
    // Array may be 0 padded if players have left the game
    while (numPlayers > 0 && game_to_players[_gameId][numPlayers - 1].id == address(0)) {
      --numPlayers;
    }
    return numPlayers;
  }

  function getDieRoll() public view returns (uint256) {
    // TODO convert require to a function modifier
    uint256 gameIndex = player_to_game[msg.sender];
    require(gameIndex != 0, 'Player not in game');

    Game memory game = games[gameIndex];
    return game.lastDieRoll;
  }

  function getNumCards(address _player) public view returns (uint256) {
    return player_to_cards[_player].length;
  }

  function getJoinableGames() public view {
    // Games that have 1 or more players
    // Turn is 0
  }

  function getStartableGames() public view {
    // Games that have 2 or more players
    // Turn is 0
  }

  function getPlayableGames() public view {
    // Games that have 2 or more players
    // Turn is greater than 0
  }

  function createGame(string memory _name) external {
    // ensure the player is not in any other game
    require(player_to_game[msg.sender] == 0, 'A player can only play one game at a time');

    uint256 suspect = INVALID;
    uint256 weapon = INVALID;
    uint256 room = INVALID;
    Crime memory crime = Crime(suspect, weapon, room);

    uint256 turn = 0;
    uint256 lastDieRoll = 0;
    bool moved = false;
    games.push(Game(_name, crime, turn, lastDieRoll, moved));
    uint256 id = games.length - 1;

    addPlayerToGame(id, msg.sender);

    emit GameCreated(id, _name, msg.sender);
  }

  function addPlayerToGame(uint256 _gameId, address _player) internal {
    uint256 numPlayers = getNumPlayers(_gameId);
    require(numPlayers < 4, 'Max 4 players per game');

    bool playerReady = true;

    player_to_game[_player] = _gameId;
    // attempt to fill any empty slots first
    uint256 numSlots = game_to_players[_gameId].length;
    uint256 i = 0;
    for (; i < numSlots; ++i) {
      if (game_to_players[_gameId][i].id == address(0)) {
        game_to_players[_gameId][i].id = _player;
        game_to_players[_gameId][i].ready = playerReady;
        game_to_players[_gameId][i].position = NO_VALUE;
        break;
      }
    }
    // no empty slots...
    if (i == numSlots) {
      game_to_players[_gameId].push(Player(_player, playerReady, NO_VALUE));
    }
  }

  function joinGame(uint256 _gameId) public {
    require(player_to_game[msg.sender] == 0, 'Player is already in a game');

    addPlayerToGame(_gameId, msg.sender);

    emit PlayerJoined(_gameId, msg.sender);
  }

  function joinAnyGame() external {
    for (uint256 i = 1; i < games.length; i++) {
      uint256 numPlayers = getNumPlayers(i);
      if (numPlayers < 2) {
        joinGame(i);
        break;
      }
    }
  }

  // shuffle cards with Fisher-Yates https://en.wikipedia.org/wiki/Fisher–Yates_shuffle
  function getShuffledOrder(
    uint256 _suspect,
    uint256 _weapon,
    uint256 _room
  ) private returns (uint256[21] memory) {
    uint256[21] memory lookup = [uint256(0), 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    // remove solution cards
    lookup[18] = _suspect;
    lookup[_suspect] = 18;
    lookup[19] = _weapon;
    lookup[_weapon] = 19;
    lookup[20] = _room;
    lookup[_room] = 20;
    // shuffle the rest
    for (uint256 i = deck.length - 4; i > 0; --i) {
      uint256 j = random(i + 1);
      uint256 t = lookup[j];
      lookup[j] = lookup[i];
      lookup[i] = t;
    }
    return lookup;
  }

  // NOTE the last 3 cards are the solution
  function dealCards(
    uint256 _gameId,
    uint256 _numPlayers,
    uint256[21] memory _lookup
  ) private {
    uint256 playerIndex = 0;
    for (uint256 i = 0; i < deck.length - 3; ++i) {
      uint256 card = deck[_lookup[i]];
      address player = game_to_players[_gameId][playerIndex].id;
      player_to_cards[player].push(card);

      emit CardDealt(card, player);

      playerIndex = (playerIndex + 1) % _numPlayers;
    }
  }

  // TODO restrict action to players in the game
  function startGame(uint256 _gameId) external {
    // discover the crime
    uint256 suspect = random(6);
    uint256 weapon = random(6) + 6;
    uint256 room = random(9) + 12;
    Crime memory crime = Crime(suspect, weapon, room);
    games[_gameId].crime = crime;
    // shuffle and deal remaining cards
    uint256 numPlayers = getNumPlayers(_gameId);
    uint256[21] memory lookup = getShuffledOrder(suspect, weapon, room);
    dealCards(_gameId, numPlayers, lookup);
    // place players on the board
    uint256[8] memory starts = gameBoard.getStarts();
    for (uint256 i = 0; i < numPlayers; ++i) {
      require(starts[i] != NO_VALUE, 'No start position available');
      game_to_players[_gameId][i].position = starts[i];

      emit PlayerMoved(_gameId, game_to_players[_gameId][i].id);
    }

    endTurn();
  }

  function getHand() public view returns (uint256[] memory) {
    return player_to_cards[msg.sender];
  }

  // TODO write a predicate that is true when a (given) player is taking a turn in a (particular) game.
  //      use parameters as necessary.
  //      note players can only play in one game at a time currently
  //      this could be used in other functions (setPlayerPosition, etc) or as a modifier.
  function isActive(uint256, uint256) private pure returns (bool) {
    return false;
  }

  function setPlayerPosition(uint256 _newPosition) public {
    uint256 gameIndex = player_to_game[msg.sender];
    require(gameIndex != 0, 'Player not in game');

    Game storage game = games[gameIndex];
    uint256 numPlayers = getNumPlayers(gameIndex);
    uint256 playerIndex = game.turn % numPlayers;
    require(game_to_players[gameIndex][playerIndex].id == msg.sender, 'Player not active');

    uint256 currentPosition = game_to_players[gameIndex][playerIndex].position;
    if (gameBoard.isValidMove(currentPosition, _newPosition, [NV, NV, NV, NV])) {
      game_to_players[gameIndex][playerIndex].position = _newPosition;
      game.moved = true;

      emit PlayerMoved(gameIndex, msg.sender);
    }
    // TODO maybe do something if it fails
  }

  function getPlayerMoved(uint256 _gameId) external view returns (bool) {
    return games[_gameId].moved;
  }

  function getTurn(uint256 _gameId) external view returns (uint256) {
    return games[_gameId].turn;
  }

  // TODO finalize parameter usage / avoidance
  function endTurn() public {
    uint256 gameIndex = player_to_game[msg.sender];
    require(gameIndex != 0, 'Player not in game');

    Game storage game = games[gameIndex];
    game.turn += 1;
    game.moved = false;

    emit TurnTaken(gameIndex);

    game.lastDieRoll = random(5) + 1;
    // NOTE event is for triggering UI update
    // TODO add appropriate player address to event
    emit DieRolled(gameIndex, address(0), game.lastDieRoll);
  }

  function random(uint256 _max) private returns (uint256) {
    prngSeed = uint256(keccak256(abi.encode(block.number)));
    return prngSeed % _max;
  }

  // Rules, official (OR) vs implemented (I)
  // (OR) No limit to number of suspects or weapons in a room
  // (OR) You can only make 1 suggestion after entering the room. Must leave and re-enter to make another.
  // (OR) Players can block doors and prevent other players from exiting a room
  // (OR) If your player was moved into a room, you can either move (roll) or make a suggestion (no roll)
  // (OR) You can suggest and accuse in the same turn
  // (OR) It looks like after making a suggestion, everyone hears the suggestion, but only the suggester
  //      sees the card that disproves it.
  function isInRoom() public view returns (bool _inRoom, uint256 _roomId) {
    uint256 gameIndex = player_to_game[msg.sender];
    require(gameIndex != 0, 'Player not in game');

    Game storage game = games[gameIndex];
    uint256 numPlayers = getNumPlayers(gameIndex);
    uint256 playerIndex = game.turn % numPlayers;
    require(game_to_players[gameIndex][playerIndex].id == msg.sender, 'Player not active');

    uint256 currentPosition = game_to_players[gameIndex][playerIndex].position;
    uint256[] memory map = gameBoard.getMap();
    // TODO hard-coded value is short-term solution
    _inRoom = (map[currentPosition] & 0x0f) == 3;
    _roomId = (map[currentPosition] >> 4) & 0x0f;
    // TODO get rid of hard-coded 13
    return (_inRoom, _roomId + 13);
  }

  // TODO gameId might not be required for suggestions and accusations
  function makeSuggestion(
    uint256 _gameId,
    uint256 _suspect,
    uint256 _weapon
  ) public returns (bool) {
    require(_gameId < games.length, 'Game does not exist');

    uint256 numPlayers = game_to_players[_gameId].length;
    uint256 activePlayerIndex = (games[_gameId].turn) % numPlayers;
    require(game_to_players[_gameId][activePlayerIndex].id == msg.sender, 'Player is not active');

    bool inRoom;
    uint256 roomId;
    (inRoom, roomId) = isInRoom();
    require(inRoom, 'Player is not in a room');

    emit SuggestionMade(_gameId, msg.sender);
    emit SuggestionData(_gameId, _suspect, _weapon, roomId);

    Crime memory crime = Crime(_suspect, _weapon, roomId);
    return disproveCrime(_gameId, activePlayerIndex, numPlayers, crime);
  }

  // iterate through opponents and try to disprove suggestion
  function disproveCrime(
    uint256 _gameId,
    uint256 _activePlayerIndex,
    uint256 _numPlayers,
    Crime memory _crime
  ) private view returns (bool) {
    uint256 opponentBaseIndex = (_activePlayerIndex + 1) % _numPlayers;
    for (uint256 i = 0; i < _numPlayers; ++i) {
      uint256 opponentIndex = (opponentBaseIndex + i) % _numPlayers;
      if (opponentIndex != _activePlayerIndex) {
        address player = game_to_players[_gameId][opponentIndex].id;
        uint256 numCards = player_to_cards[player].length;
        for (uint256 cardId = 0; cardId < numCards; ++cardId) {
          uint256 card = player_to_cards[player][cardId];
          if (card == _crime.suspect || card == _crime.weapon || card == _crime.room) {
            return true;
          }
        }
      }
    }
    return false;
  }

  function makeAccusation(
    uint256 _gameId,
    uint256 _suspect,
    uint256 _weapon
  ) public returns (bool) {
    require(_gameId < games.length, 'Game does not exist');

    bool inRoom;
    uint256 roomId;
    (inRoom, roomId) = isInRoom();
    require(inRoom, 'Player is not in a room');

    uint256 numPlayers = game_to_players[_gameId].length;
    uint256 activePlayerIndex = (games[_gameId].turn) % numPlayers;
    emit AccusationMade(_gameId, game_to_players[_gameId][activePlayerIndex].id);
    emit AccusationData(_gameId, _suspect, _weapon, roomId);

    require(_gameId >= 0 && _gameId < games.length);
    Game memory game = games[_gameId];
    // compare accusation to Game crime
    Crime memory crime = Crime(_suspect, _weapon, roomId);
    bool solved = _hashCrime(crime) == _hashCrime(game.crime);
    // accuser wins or is kicked
    if (solved) {
      // wins
      console.log('YOU WIN', msg.sender);
    } else {
      // loses
      console.log('YOU LOSE', msg.sender);
    }
    return solved;
  }

  // NOTE leave game in playable state when possible
  // TODO deal with leaving after start
  // TODO deal with game-ending exits
  // TODO reveal all player cards
  // TODO consider stake sacrifice as penalty
  function leaveGame() external {
    uint256 gameId = player_to_game[msg.sender];
    if (gameId != 0) {
      require(games[gameId].turn == 0, 'Leaving after start not yet supported');

      player_to_game[msg.sender] = 0;
      // remove from list of game's players
      uint256 numPlayers = getNumPlayers(gameId);
      for (uint256 i = 0; i < numPlayers; i++) {
        if (game_to_players[gameId][i].id == msg.sender) {
          delete game_to_players[gameId][i];
          game_to_players[gameId][i] = game_to_players[gameId][numPlayers - 1];
          break;
        }
      }
    } else {
      // TODO add address in readable format
      string memory message = string(abi.encodePacked(msg.sender, ' is not playing'));
      console.log(message);
    }
  }

  function _hashCrime(Crime memory _crime) internal pure returns (bytes32 hash) {
    return keccak256(abi.encodePacked(_crime.suspect, _crime.weapon, _crime.room));
  }
}

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
    uint256 discarded;
    uint256 turn;
    bool moved;
  }

  mapping(uint256 => Player[]) public game_to_players;
  mapping(address => uint256) public player_to_game;
  mapping(address => uint256[]) public player_to_cards;

  Game[] public games;

  GameBoard gameBoard;

  constructor() {
    // HACK create INVALID game as fake null
    Crime memory crime = Crime(INVALID, INVALID, INVALID);
    uint256 discarded = 0;
    uint256 turn = 0;
    games.push(Game('** INVALID **', crime, discarded, turn, false));

    createBoard();
  }

  // Room format: id, x pos, y pos, width, height, [doors]
  function createBoard() internal {
    gameBoard = new GameBoard('Default Board');

    gameBoard.addStarts([uint256(16), 120, 191, 432, 585, 590, NV, NV]);

    // TODO move IDs to constants
    // study
    gameBoard.addRoom(GameBoard.Room(0, 0, 0, 6, 1, [NV, NV, NV, NV], [NV, NV]));
    gameBoard.addRoom(GameBoard.Room(0, 0, 1, 7, 3, [20, NV, NV, NV], [uint256(14), 8]));

    // library
    gameBoard.addRoom(GameBoard.Room(1, 1, 6, 5, 1, [NV, NV, NV, NV], [NV, NV]));
    gameBoard.addRoom(GameBoard.Room(1, 0, 7, 7, 3, [13, NV, NV, NV], [NV, NV]));
    gameBoard.addRoom(GameBoard.Room(1, 1, 10, 5, 1, [2, NV, NV, NV], [NV, NV]));

    // billiard
    gameBoard.addRoom(GameBoard.Room(2, 0, 12, 6, 5, [1, 23, NV, NV], [NV, NV]));

    // conservatory
    gameBoard.addRoom(GameBoard.Room(3, 1, 19, 4, 1, [3, NV, NV, NV], [uint256(0), 6]));
    gameBoard.addRoom(GameBoard.Room(3, 0, 20, 6, 4, [NV, NV, NV, NV], [NV, NV]));

    // hall
    gameBoard.addRoom(GameBoard.Room(4, 9, 0, 6, 7, [24, 38, 39, NV], [NV, NV]));

    // ballroom
    gameBoard.addRoom(GameBoard.Room(5, 8, 17, 8, 6, [uint256(1), 6, 16, 23], [NV, NV]));
    gameBoard.addRoom(GameBoard.Room(5, 10, 23, 4, 2, [NV, NV, NV, NV], [NV, NV]));

    // lounge
    gameBoard.addRoom(GameBoard.Room(6, 18, 0, 6, 1, [NV, NV, NV, NV], [NV, NV]));
    gameBoard.addRoom(GameBoard.Room(6, 17, 1, 7, 5, [28, NV, NV, NV], [uint256(34), 3]));

    // dining room
    gameBoard.addRoom(GameBoard.Room(7, 16, 9, 8, 6, [1, 24, NV, NV], [NV, NV]));
    gameBoard.addRoom(GameBoard.Room(7, 19, 15, 5, 1, [NV, NV, NV, NV], [NV, NV]));

    // kitchen
    gameBoard.addRoom(GameBoard.Room(8, 18, 18, 5, 1, [1, NV, NV, NV], [NV, NV]));
    gameBoard.addRoom(GameBoard.Room(8, 18, 19, 6, 5, [NV, NV, NV, NV], [uint256(24), 0]));
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

  // TODO placeholder logic
  function getDieRoll() public view returns (uint256) {
    uint256 gameIndex = player_to_game[msg.sender];
    require(gameIndex != 0, 'Player not in game');

    return 6;
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

    // TODO randomize selection
    uint256 suspect = MUSTARD;
    uint256 weapon = ROPE;
    uint256 room = BILLIARD;
    Crime memory crime = Crime(suspect, weapon, room);

    uint256 discarded = 0;
    discarded += 1 << crime.suspect;
    discarded += 1 << crime.weapon;
    discarded += 1 << crime.room;

    uint256 turn = 0;

    games.push(Game(_name, crime, discarded, turn, false));
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

  // TODO for info on random numbers see https://ethereum.stackexchange.com/questions/54375/solidity-choosing-5-random-values-of-an-array
  function startGame(uint256 _gameId) external {
    // shuffle cards with deterministic lookup
    uint256[21] memory lookup = [uint256(0), 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    for (uint256 i = 0; i < deck.length; ++i) {
      uint256 id0 = (7 + 2 * i) % deck.length;
      uint256 id1 = (13 + i) % deck.length;
      uint256 t = lookup[id0];
      lookup[id0] = lookup[id1];
      lookup[id1] = t;
    }

    // deal cards to players
    uint256 discarded = games[_gameId].discarded;
    uint256 numPlayers = getNumPlayers(_gameId);
    uint256 playerIndex = 0;
    for (uint256 i = 0; i < deck.length; ++i) {
      uint256 card = deck[lookup[i]];
      uint256 flag = 1 << card;
      if (discarded & flag == 0) {
        // assign card id to player
        address player = game_to_players[_gameId][playerIndex].id;
        player_to_cards[player].push(card);

        emit CardDealt(card, player);

        playerIndex = (playerIndex + 1) % numPlayers;
      }
    }

    // place players
    uint256[8] memory starts = gameBoard.getStarts();
    for (uint256 i = 0; i < numPlayers; ++i) {
      require(starts[i] != NO_VALUE, 'No start position available');
      game_to_players[_gameId][i].position = starts[i];

      emit PlayerMoved(_gameId, game_to_players[_gameId][i].id);
    }

    // TODO this feels a bit janky
    endTurn();
  }

  function getHand() public view returns (uint256[] memory) {
    return player_to_cards[msg.sender];
  }

  function getDiscardPile() public view returns (uint256[] memory) {
    uint256 gameIndex = player_to_game[msg.sender];
    require(gameIndex != 0, 'Player not in game');

    uint256 count = 0;
    for (uint256 i = 0; i < deck.length; ++i) {
      count += (games[gameIndex].discarded >> i) & 1;
    }

    uint256 cardIndex = 0;
    uint256[] memory output = new uint256[](count);
    for (uint256 i = 0; i < deck.length; ++i) {
      uint256 flag = 1 << i;
      if (games[gameIndex].discarded & flag != 0) {
        output[cardIndex++] = i;
      }
    }
    return output;
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

    // TODO placeholder, for triggering UI update
    emit DieRolled(gameIndex, address(0), 0);
  }

  function makeSuggestion(uint256 _gameId, Crime memory _crime) public returns (bool) {
    require(_gameId > 0 && _gameId < games.length);

    bool disproved = false;

    // iterate through opponents and try to disprove suggestion
    uint256 numPlayers = game_to_players[_gameId].length;
    uint256 activePlayerIndex = (games[_gameId].turn) % numPlayers;
    emit SuggestionMade(_gameId, game_to_players[_gameId][activePlayerIndex].id);
    emit SuggestionData(_gameId, _crime.suspect, _crime.weapon, _crime.room);
    uint256 opponentBaseIndex = (activePlayerIndex + 1) % numPlayers;
    for (uint256 i = 0; i < numPlayers; ++i) {
      uint256 opponentIndex = (opponentBaseIndex + i) % numPlayers;
      if (opponentIndex != activePlayerIndex) {
        address player = game_to_players[_gameId][opponentIndex].id;
        uint256 numCards = player_to_cards[player].length;
        for (uint256 cardId = 0; cardId < numCards; ++cardId) {
          uint256 card = player_to_cards[player][cardId];
          if (card == _crime.suspect || card == _crime.weapon || card == _crime.room) {
            games[_gameId].discarded += 1 << card;
            delete player_to_cards[player][cardId];
            emit CardDiscarded(card, player);
            disproved = true;
            break;
          }
        }
      }
    }
    return disproved;
  }

  function makeAccusation(uint256 _gameId, Crime memory _crime) public returns (bool) {
    require(_gameId >= 0 && _gameId < games.length);
    Game storage game = games[_gameId];
    // compare accusation to Game crime
    bool solved = _hashCrime(_crime) == _hashCrime(game.crime);
    // accuser wins or is kicked
    if (solved) {
      // wins
    } else {
      // loses
    }
    return solved;
  }

  // NOTE leave game in playable state when possible
  // TODO deal with leaving after start
  // TODO deal with game-ending exits
  // TODO discard all player cards
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

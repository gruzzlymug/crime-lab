// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './BaseCase.sol';
import 'hardhat/console.sol';

contract CrimeLab is BaseCase {
  event GameCreated(uint256 gameId, string name, address creator);
  event PlayerJoined(uint256 gameId, address player);
  event SuggestionMade(uint256 gameId, address player);
  event SuggestionData(uint256 gameId, uint256 suspect, uint256 weapon, uint256 room);
  event TurnTaken(uint256 gameId);

  struct Player {
    address id;
    bool ready;
    // TODO use or remove
    // uint256[] cards;
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
  }

  mapping(uint256 => Player[]) public game_to_players;
  mapping(address => uint256) public player_to_game;
  mapping(address => uint256[]) public player_to_cards;

  Game[] public games;

  constructor() {
    // HACK create INVALID game as fake null
    Crime memory crime = Crime(INVALID, INVALID, INVALID);
    uint256 discarded = 0;
    uint256 turn = 0;
    games.push(Game('** INVALID **', crime, discarded, turn));
  }

  function getName(uint256 _gameId) external view returns (string memory) {
    return games[_gameId].name;
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

  function getNumCards(address player) public view returns (uint256) {
    return player_to_cards[player].length;
  }

  function getTurn(uint256 _gameId) external view returns (uint256) {
    return games[_gameId].turn;
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

    games.push(Game(_name, crime, discarded, turn));
    uint256 id = games.length - 1;

    addPlayerToGame(id, msg.sender);

    emit GameCreated(id, _name, msg.sender);
  }

  function addPlayerToGame(uint256 _gameId, address _player) internal {
    require(getNumPlayers(_gameId) < 4, 'Max 4 players per game');

    bool playerReady = true;

    player_to_game[_player] = _gameId;
    // attempt to fill any empty slots first
    uint256 numSlots = game_to_players[_gameId].length;
    uint256 i = 0;
    for (; i < numSlots; ++i) {
      if (game_to_players[_gameId][i].id == address(0)) {
        game_to_players[_gameId][i].id = _player;
        game_to_players[_gameId][i].ready = playerReady;
        break;
      }
    }
    // no empty slots...
    if (i == numSlots) {
      game_to_players[_gameId].push(Player(_player, playerReady));
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

  function startGame(uint256 _gameId) external {
    // shuffle cards with deterministic lookup
    // TODO for info on random numbers see https://ethereum.stackexchange.com/questions/54375/solidity-choosing-5-random-values-of-an-array
    uint256[21] memory lookup = [
      // explicit type to avoid compile error
      uint256(0),
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20
    ];
    for (uint256 i = 0; i < deck.length; ++i) {
      uint256 id0 = (7 + 2 * i) % deck.length;
      uint256 id1 = (13 + i) % deck.length;
      uint256 t = lookup[id0];
      lookup[id0] = lookup[id1];
      lookup[id1] = t;
    }

    // deal cards to players
    uint256 discarded = games[_gameId].discarded;
    uint256 numPlayers = game_to_players[_gameId].length;
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

    games[_gameId].turn += 1;

    emit TurnTaken(_gameId);
  }

  function takeTurn(uint256 _gameId) public {
    // whose turn is it
    // what happens during turn
    Crime memory suggestion = Crime(SCARLET, WRENCH, CONSERVATORY);
    makeSuggestion(_gameId, suggestion);
    // who is next
    games[_gameId].turn += 1;

    emit TurnTaken(_gameId);
  }

  function makeSuggestion(uint256 _gameId, Crime memory _crime) public returns (bool) {
    require(_gameId >= 0 && _gameId < games.length);

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
            emit CardDiscarded(card, player);
            disproved = true;
            break;
          }
        }
      }
    }
    return disproved;
  }

  function makeAccusation(uint256 _gameId, Crime memory _crime) external view returns (bool) {
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

  // TODO leave game in playable state when possible
  // TODO discard all player cards
  // TODO deal with game-ending exits
  // TODO consider stake sacrifice as penalty
  function leaveGame() external {
    uint256 gameId = player_to_game[msg.sender];
    if (gameId != 0) {
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

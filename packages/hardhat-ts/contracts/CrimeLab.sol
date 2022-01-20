// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './BaseCase.sol';
import 'hardhat/console.sol';

// above import enables us to log with hardhat
// example: console.log('games length: ', games.length);

contract CrimeLab is BaseCase {
  event GameCreated(uint256 gameId, string name, address creator);
  event PlayerJoined(uint256 gameId, address player);
  event SuggestionMade(uint256 gameId, address player);
  event SuggestionData(uint256 gameId, uint256 suspect, uint256 weapon, uint256 room);

  struct Player {
    address id;
    uint256[] cards;
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

  mapping(uint256 => address[]) public game_to_players;
  mapping(address => uint256) public player_to_game;
  mapping(address => uint256[]) public player_to_cards;

  Game[] public games;

  function getName(uint256 _gameId) external view returns (string memory) {
    return games[_gameId].name;
  }

  function getGameId() public view returns (uint256) {
    return player_to_game[msg.sender];
  }

  function getNumPlayers(uint256 _gameId) public view returns (uint256) {
    require(game_to_players[_gameId].length > 0, 'Game does not exist');

    return uint256(game_to_players[_gameId].length);
  }

  function getNumCards(address player) public view returns (uint256) {
    return player_to_cards[player].length;
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

    player_to_game[msg.sender] = id;
    game_to_players[id].push(msg.sender);

    emit GameCreated(id, _name, msg.sender);
  }

  function joinGame(uint256 _gameId) external {
    // TODO ensure player can't join game more than once
    require(game_to_players[_gameId].length < 4, 'Max 4 players per game');

    game_to_players[_gameId].push(msg.sender);

    emit PlayerJoined(_gameId, msg.sender);
  }

  function joinAnyGame() external {
    uint256 i;
    for (i = 0; i < games.length; i++) {
      uint256 numPlayers = getNumPlayers(i);
      if (numPlayers < 2) {
        game_to_players[i].push(msg.sender);
        emit PlayerJoined(i, msg.sender);
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
    uint256 playerId = 0;
    for (uint256 i = 0; i < deck.length; ++i) {
      uint256 card = deck[lookup[i]];
      uint256 flag = 1 << card;
      if (discarded & flag == 0) {
        // assign card id to player
        address player = game_to_players[_gameId][playerId];
        player_to_cards[player].push(card);

        emit CardDealt(card, player);

        playerId = (playerId + 1) % numPlayers;
      }
    }

    games[_gameId].turn += 1;
  }

  function takeTurn(uint256 _gameId) public {
    // whose turn is it
    // what happens during turn
    Crime memory suggestion = Crime(SCARLET, WRENCH, CONSERVATORY);
    makeSuggestion(_gameId, suggestion);
    // who is next
    games[_gameId].turn += 1;
  }

  function makeSuggestion(uint256 _gameId, Crime memory _crime) public returns (bool) {
    require(_gameId >= 0 && _gameId < games.length);

    bool disproved = false;

    // iterate through opponents and try to disprove suggestion
    uint256 numPlayers = game_to_players[_gameId].length;
    uint256 activePlayerId = (games[_gameId].turn) % numPlayers;
    emit SuggestionMade(_gameId, game_to_players[_gameId][activePlayerId]);
    emit SuggestionData(_gameId, _crime.suspect, _crime.weapon, _crime.room);
    uint256 opponentBaseId = (activePlayerId + 1) % numPlayers;
    for (uint256 i = 0; i < numPlayers; ++i) {
      uint256 opponentId = (opponentBaseId + i) % numPlayers;
      if (opponentId != activePlayerId) {
        address player = game_to_players[_gameId][opponentId];
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

  function _hashCrime(Crime memory _crime) internal pure returns (bytes32 hash) {
    return keccak256(abi.encodePacked(_crime.suspect, _crime.weapon, _crime.room));
  }
}

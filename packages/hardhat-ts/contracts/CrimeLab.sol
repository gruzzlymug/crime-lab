// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./BaseCase.sol";

contract CrimeLab is BaseCase {
  event GameCreated(uint gameId, string name, address creator);
  event PlayerJoined(uint gameId, address player);
  event SuggestionMade(uint gameId, address player);
  event SuggestionData(uint gameId, uint suspect, uint weapon, uint room);

  struct Player {
    address id;
    uint[] cards;
  }

  struct Crime {
    uint suspect;
    uint weapon;
    uint room;
  }

  struct Game {
    string name;
    Crime crime;
    uint discarded;
    uint turn;
  }

  mapping(uint => address[]) public game_to_players;
  mapping(address => uint) public player_to_game;
  mapping(address => uint[]) public player_to_cards;

  Game[] public games;

  function getName(uint _gameId) external view returns (string memory) {
    return games[_gameId].name;
  }

  function getGameId() public view returns (uint) {
    return player_to_game[msg.sender];
  }

  function getNumPlayers(uint _gameId) public view returns (uint) {
    // TODO add require
    return uint(game_to_players[_gameId].length);
  }

  function getNumCards(address player) public view returns (uint) {
    return player_to_cards[player].length;
  }

  function createGame(string memory _name) external {
    // ensure the player is not in any other game
    require(player_to_game[msg.sender] == 0, "A player can only play one game at a time");

    // TODO randomize selection
    uint suspect = MUSTARD;
    uint weapon = ROPE;
    uint room = BILLIARD;
    Crime memory crime = Crime(suspect, weapon, room);

    uint discarded = 0;
    discarded += 1 << crime.suspect;
    discarded += 1 << crime.weapon;
    discarded += 1 << crime.room;

    uint turn = 0;

    games.push(Game(_name, crime, discarded, turn));
    uint id = games.length - 1;

    player_to_game[msg.sender] = id;
    game_to_players[id].push(msg.sender);

    emit GameCreated(id, _name, msg.sender);
  }

  function joinGame(uint _gameId) external {
    game_to_players[_gameId].push(msg.sender);

    emit PlayerJoined(_gameId, msg.sender);
  }

  function startGame(uint _gameId) external {
    // shuffle cards with deterministic lookup
    // TODO for info on random numbers see https://ethereum.stackexchange.com/questions/54375/solidity-choosing-5-random-values-of-an-array
    uint[21] memory lookup = [
      // explicit type to avoid compile error
      uint256(0), 1, 2, 3, 4, 5, 6,
      7, 8, 9, 10, 11, 12,
      13, 14, 15, 16, 17, 18, 19, 20
    ];
    for (uint i = 0; i < deck.length; ++i) {
      uint id0 = (7 + 2 * i) % deck.length;
      uint id1 = (13 + i) % deck.length;
      uint t = lookup[id0];
      lookup[id0] = lookup[id1];
      lookup[id1] = t;
    }

    // deal cards to players
    uint discarded = games[_gameId].discarded;
    uint numPlayers = game_to_players[_gameId].length;
    uint playerId = 0;
    for (uint i = 0; i < deck.length; ++i) {
      uint card = deck[lookup[i]];
      uint flag = 1 << card;
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

  function takeTurn(uint _gameId) public {
    // whose turn is it
    // what happens during turn
    Crime memory suggestion = Crime(SCARLET, WRENCH, CONSERVATORY);
    makeSuggestion(_gameId, suggestion);
    // who is next
    games[_gameId].turn += 1;
  }

  function makeSuggestion(uint _gameId, Crime memory _crime) public returns (bool) {
    require(_gameId >= 0 && _gameId < games.length);

    bool disproved = false;

    // iterate through opponents and try to disprove suggestion
    uint numPlayers = game_to_players[_gameId].length;
    uint activePlayerId = (games[_gameId].turn) % numPlayers;
    emit SuggestionMade(_gameId, game_to_players[_gameId][activePlayerId]);
    emit SuggestionData(_gameId, _crime.suspect, _crime.weapon, _crime.room);
    uint opponentBaseId = (activePlayerId + 1) % numPlayers;
    for (uint i = 0; i < numPlayers; ++i) {
      uint opponentId = (opponentBaseId + i) % numPlayers;
      if (opponentId != activePlayerId) {
        address player = game_to_players[_gameId][opponentId];
        uint numCards = player_to_cards[player].length;
        for (uint cardId = 0; cardId < numCards; ++cardId) {
          uint card = player_to_cards[player][cardId];
          if (
            card == _crime.suspect ||
            card == _crime.weapon ||
            card == _crime.room
          ) {
            emit CardDiscarded(card, player);
            disproved = true;
            break;
          }
        }
      }
    }
    return disproved;
  }

  function makeAccusation(uint _gameId, Crime memory _crime) external view returns (bool) {
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

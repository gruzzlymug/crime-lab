// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import 'hardhat/console.sol';

interface IHasher {
  function MiMCSponge(
    uint256 in_xL,
    uint256 in_xR,
    uint256 in_k
  ) external pure returns (uint256 xL, uint256 xR);
}

interface IChoiceVerifier {
  function verifyProof(
    uint256[2] memory a,
    uint256[2][2] memory b,
    uint256[2] memory c,
    uint256[2] memory input
  ) external view returns (bool r);
}

// Rock (0) Paper (1) Scissors (2)
contract MinimalGame {
  struct Proof {
    uint256[2] a;
    uint256[2][2] b;
    uint256[2] c;
    uint256[2] input;
  }

  struct Player {
    address id;
    Proof proof;
    int256 choice;
  }

  struct Game {
    Player player1;
    Player player2;
    address winner; // TODO remove
    // uint256 block_timer; // TODO will be used as a timeout for the game
  }

  mapping(address => uint256) public player_to_game;

  Game[] public games;
  IChoiceVerifier cv; // verifier for proving choice rule compliance
  IHasher hasher; // mimc hasher

  constructor(address _cv, address _hasher) {
    cv = IChoiceVerifier(_cv);
    hasher = IHasher(_hasher);

    // generate fake proof for fake player
    uint256[2] memory _in;
    for (uint256 i = 0; i < 2; i++) _in[i] = i;

    uint256[2] memory a;
    for (uint256 i = 0; i < 2; i++) a[i] = i;

    uint256[2][2] memory b;
    for (uint256 i = 0; i < 2; i++) b[i] = a;

    Proof memory fakeProof = Proof(a, b, a, _in);

    // create an invalid game at position 0
    games.push(Game(Player(address(0), fakeProof, -1), Player(address(0), fakeProof, -1), address(0)));
  }

  // TODO add proof as input
  function joinGame(
    uint256[2] memory a,
    uint256[2] memory b_0,
    uint256[2] memory b_1,
    uint256[2] memory c,
    uint256[2] memory input
  ) public {
    require(player_to_game[msg.sender] == 0, 'Player is already in a game');
    // only accept valid choices (input[0] is 1: number is valid, or 0: invalid number )
    require(input[0] == 1, 'Invalid choice!');
    // only accept valid proofs
    require(cv.verifyProof(a, [b_0, b_1], c, input), 'Invalid Choice Proof!');
    Proof memory proof = Proof(a, [b_0, b_1], c, input);

    // search for a game in need of a player
    for (uint256 i = 1; i < games.length; i++) {
      if (games[i].player2.id == address(0)) {
        // add player to empty Player2 slot of game
        games[i].player2 = Player(msg.sender, proof, -1);
        player_to_game[msg.sender] = i;
        // TODO start game block timer
        // TODO emit GameStarted event
        return;
      }
    }

    // create new game if no available game found
    // add player to new game's Player1 slot. Player2 slot is null address
    // generate fake proof for fake player
    uint256[2] memory _in;
    for (uint256 i = 0; i < 2; i++) _in[i] = i;

    uint256[2] memory _a;
    for (uint256 i = 0; i < 2; i++) _a[i] = i;

    uint256[2][2] memory _b;
    for (uint256 i = 0; i < 2; i++) _b[i] = _a;

    Proof memory fakeProof = Proof(_a, _b, _a, _in);
    games.push(Game(Player(msg.sender, proof, -1), Player(address(0), fakeProof, -1), address(0)));
    player_to_game[msg.sender] = games.length - 1;
  }

  function revealChoice(uint256 choice, uint256 salt) public {
    require(player_to_game[msg.sender] != 0, 'Player must be in a game');

    // verify that the game hasn't already been won
    Game storage _game = games[player_to_game[msg.sender]];
    require(_game.winner == address(0), 'Game has already been won!');

    // verify that the components given can compute mimc hash
    require(choice < 3, 'Choice was invalid');
    require(choice >= 0, 'Choice was invalid');

    // compute mimc hash of provided choice
    uint256 R;
    uint256 C;
    (R, C) = hasher.MiMCSponge(choice, uint256(0), salt);

    // check that this players revealed choice matches what they told
    if (_game.player1.id == msg.sender) {
      require(_game.player1.proof.input[1] == R, 'Revealed choice invalid');
    } else if (_game.player2.id == msg.sender) {
      require(_game.player2.proof.input[1] == R, 'Revealed choice invalid');
    } else {
      require(1 == 0, 'Player not in game');
    }

    // update player choice
    if (_game.player1.id == msg.sender) {
      _game.player1.choice = int256(choice);
    } else if (_game.player2.id == msg.sender) {
      _game.player2.choice = int256(choice);
    } else {
      require(1 == 0, 'Player not in game');
    }

    // check if both players have a valid choice
    if (_game.player1.choice != -1 && _game.player2.choice != -1) {
      // determine winner
      Player memory _winner;

      // paper beats rock
      if (_game.player1.choice == 1 && _game.player2.choice == 0) {
        _winner = _game.player1;
      } else if (_game.player1.choice == 0 && _game.player2.choice == 1) {
        _winner = _game.player2;
      }
      // scissors beats paper
      else if (_game.player1.choice == 2 && _game.player2.choice == 1) {
        _winner = _game.player1;
      } else if (_game.player1.choice == 1 && _game.player2.choice == 2) {
        _winner = _game.player2;
      }
      // rock beats scissors
      else if (_game.player1.choice == 0 && _game.player2.choice == 2) {
        _winner = _game.player1;
      } else if (_game.player1.choice == 2 && _game.player2.choice == 0) {
        _winner = _game.player2;
      }
      // handle tie
      else if (_game.player1.choice == _game.player2.choice) {
        // TODO split the winnings
        // TODO set game winner to something invalid, but not address(0)
      }

      // TODO award winnings
      // delete game??
      _game.winner = _winner.id;
      player_to_game[_game.player1.id] = 0;
      player_to_game[_game.player2.id] = 0;
    }
  }

  function getGameId() public view returns (uint256) {
    return player_to_game[msg.sender];
  }

  function getGameWinner(uint256 _gameId) public view returns (address) {
    return games[_gameId].winner;
  }
}

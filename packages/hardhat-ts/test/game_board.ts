import { ethers } from 'hardhat';
import { expect } from 'chai';

// TODO fix type
function dumpMap(map: any) {
  const rows = 25;
  const cols = 24;

  let line = '';
  for (let i = 0; i < map.length; ++i) {
    if (i > 0 && i % cols === 0) {
      console.log(line);
      line = '';
    }
    line += ' ' + map[i].toNumber();
  }
}

describe("GameBoard", function () {
  it("should do something", async function () {
    const GameBoard = await ethers.getContractFactory("GameBoard");
    const gameBoard = await GameBoard.deploy("Buzzo");
    await gameBoard.deployed();
    // const map = await gameBoard.getMap();
    // dumpMap(map);

    expect(true).to.equal(true);
  })

  it("recognize a valid move", async function () {
    const GameBoard = await ethers.getContractFactory("GameBoard");
    const gameBoard = await GameBoard.deploy("Dale");
    await gameBoard.deployed();

    const NO_VALUE = 65535;
    const start = 25;
    const end = 25 + (5 * 24);
    await gameBoard.addStarts([start, NO_VALUE, NO_VALUE, NO_VALUE, NO_VALUE, NO_VALUE, NO_VALUE, NO_VALUE,]);
    // const map = await gameBoard.getMap();
    // dumpMap(map);

    const moveIsValid = await gameBoard.isValidMove(start, end, [NO_VALUE, NO_VALUE, NO_VALUE, NO_VALUE]);
    expect(moveIsValid).to.equal(true);
  })
})
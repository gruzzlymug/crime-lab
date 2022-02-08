import { ethers } from 'hardhat';
import { expect } from 'chai';

describe("GameBoard", function () {
  it("should do something", async function () {
    const GameBoard = await ethers.getContractFactory("GameBoard");
    const gameBoard = await GameBoard.deploy("Buzzo");

    await gameBoard.deployed();

    // NOTE just for initial dev / debugging
    const map = await gameBoard.getMap();
    let line = '';
    for (let i = 0; i < map.length; ++i) {
      if (i > 0 && i % 22 === 0) {
        console.log(line);
        line = '';
      }
      line += ' ' + map[i].toNumber();
    }
    expect(true).to.equal(true);
  })
})
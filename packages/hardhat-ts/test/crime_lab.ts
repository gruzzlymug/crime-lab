import { ethers } from 'hardhat';
import { expect } from 'chai';

describe("CrimeLab", function () {
  it("should create a game", async function () {
    const CrimeLab = await ethers.getContractFactory("CrimeLab");
    const crimeLab = await CrimeLab.deploy();

    await crimeLab.createGame("MURDER!");
    expect(await crimeLab.getName(1)).to.equal("MURDER!");
  });
});

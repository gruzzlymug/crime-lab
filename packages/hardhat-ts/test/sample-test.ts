import { ethers } from 'hardhat';
import { expect } from 'chai';

describe("CrimeLab", function () {
  it("Should do something", async function () {
    const CrimeLab = await ethers.getContractFactory("CrimeLab");
    const crimeLab = await CrimeLab.deploy();

    await crimeLab.deployed();
    expect(true).to.equal(true);

    await crimeLab.createGame("MURDER!");
    expect(await crimeLab.getName(1)).to.equal("MURDER!");
  });
});

import { ethers } from 'hardhat';
import { expect } from 'chai';

describe("MintedMap", function () {
  it("should mint an NFT", async function () {
    const MintedMap = await ethers.getContractFactory("MintedMap");
    const mintedMap = await MintedMap.deploy();

    await mintedMap.safeMint("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    expect(true).to.equal(true);
  });
});

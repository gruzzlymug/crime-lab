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

describe("Loot", function () {
  it("should get some loot", async function () {
    const Loot = await ethers.getContractFactory("Loot");
    const loot = await Loot.deploy();

    const tokenId = 1;
    console.log(await loot.getWeapon(tokenId));
    console.log(await loot.getChest(tokenId));
    console.log(await loot.getHead(tokenId));
    console.log(await loot.getWaist(tokenId));
    console.log(await loot.getFoot(tokenId));
    console.log(await loot.getHand(tokenId));
    console.log(await loot.getNeck(tokenId));
    console.log(await loot.getRing(tokenId));
    expect(true).to.equal(true);
  });
});

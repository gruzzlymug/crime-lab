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

  describe("Dungeons", function () {
    it("should generate a dungeon", async function () {
      const DG = await ethers.getContractFactory("dungeonsGenerator");
      const dg = await DG.deploy();
      const DR = await ethers.getContractFactory("dungeonsRender");
      const dr = await DR.deploy();
      const DS = await ethers.getContractFactory("dungeonsSeeder");
      const ds = await DS.deploy();

      const Dungeons = await ethers.getContractFactory("Dungeons");
      const dungeons = await Dungeons.deploy(dr["address"], dg["address"], ds["address"]);

      const tokenId = 1;
      dungeons.claim(tokenId, { value: ethers.utils.parseEther("0.5") });
      console.log(await dungeons.getSvg(tokenId));
      expect(true).to.equal(true);
    });
  });

  describe("Blitmap", function () {
    it("should create a blitmap", async function () {
      const Blitmap = await ethers.getContractFactory("Blitmap");
      const blitmap = await Blitmap.deploy();

      // TBD

      expect(true).to.equal(true);
    });
  });

});

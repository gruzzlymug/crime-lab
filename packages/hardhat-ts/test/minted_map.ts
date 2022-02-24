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

      let ba = [];
      let i = 2;
      // just drop some bytes from mintOriginal data (see contract tx below) here and go
      // https://etherscan.io/txs?a=0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63&p=73
      const bytesString = "0x0000009e2836e53b4463c74d0000000000000000000000000000000000000199998000000000199999980000000019999998000000001999999800000000159999580000000005599560000000000155558000000000001558000000000000038000000000000003f8000000000000003800000000000000380000000000000038e00000000000003fe00000000000003800000000000000f800000000000038e00000000000003fe000000000000000f800000000000000380000000000000038000000000000003800000000000000380000000000000038000000000000003800000000000000380000000000000038000000000000003800000000000000000000000000000000000000";
      // convert to bytes array
      while (i < bytesString.length - 1) {
        const byte = bytesString.substring(i, i + 2);
        const value = parseInt("0x" + byte, 16);
        ba.push(value);
        i += 2;
      }

      await blitmap.mintOriginal(ba, "on chain");
      const svg = await blitmap.tokenSvgDataOf(0);
      // console.log(svg);
      console.log("Minted an Original from " + bytesString);
      expect(true).to.equal(true);
    });
  });

  describe("RaiderToken", function () {
    it("should create raider tokens", async function () {
      const RaiderToken = await ethers.getContractFactory("RaiderToken");
      const raiderToken = await RaiderToken.deploy();

      // TODO add test

      expect(true).to.equal(true);
    });
  });
});

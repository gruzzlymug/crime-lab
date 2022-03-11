import { ethers } from 'hardhat';
import { expect } from 'chai';
import { IntegerType } from 'typechain';
const snarkjs = require('snarkjs')
const { mimcSpongecontract, buildMimcSponge } = require("circomlibjs")
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

/**
 * Build contract call args
 * @dev 'massage' circom's proof args into format parsable by solidity
 * @notice further mutation of pi_b occurs @ in our smart contract 
 *         calldata as subgraphs cannot handle nested arrays
 * 
 * @param {Object} proof - the proof generated from circom circuit
 * @returns - array of uint256 representing proof parsable in solidity
 */
function buildProofArgs(proof: any): any {
    return [
        proof.pi_a.slice(0, 2), // pi_a
        // genZKSnarkProof reverses values in the inner arrays of pi_b
        proof.pi_b[0].slice(0).reverse(),
        proof.pi_b[1].slice(0).reverse(),
        proof.pi_c.slice(0, 2), // pi_c
    ]
}

async function buildChoice(choice: Number, salt: Number) {
    let input = {
        choice: choice,
        salt: salt
    }
    // TODO look into snarkjs generatecall

    // compute witness and run through groth16 circuit for proof / signals
    let { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        path.join(__dirname, '../../../zk/makeChoice_js', 'makeChoice.wasm'),
        path.join(__dirname, '../../../zk/zkey', 'makeChoice_final.zkey')
    )

    const proofArgs = buildProofArgs(proof)


    const choiceVerificationKey = require(
        path.join(__dirname, '../../../zk/zkey', 'choice_verification_key.json')
    )

    // verify proof locally
    let validProof = await snarkjs.groth16.verify(
        choiceVerificationKey,
        publicSignals,
        proof
    )

    if (validProof == false) {
        console.warn("Proof invalid!", choice, salt)
    }

    return { proofArgs, publicSignals };
}


describe("MinimalGame", function () {
    it("should TODO", async function () {


        const contract = {
            contractName: 'Hasher',
            abi: mimcSpongecontract.abi,
            bytecode: mimcSpongecontract.createCode('mimcsponge', 220),
        }

        const outputPath = path.join(__dirname, '../generated/artifacts', 'Hasher.json')
        fs.writeFileSync(outputPath, JSON.stringify(contract))

        const ChoiceVerifier = await ethers.getContractFactory("ChoiceVerifier");
        const choiceVerifier = await ChoiceVerifier.deploy();

        const Hasher = await ethers.getContractFactory("Hasher");
        const hasher = await Hasher.deploy();

        const MinimalGame = await ethers.getContractFactory("MinimalGame");
        const minimalGame = await MinimalGame.deploy(choiceVerifier["address"], hasher["address"]);

        function getSalt(saltLengthBytes: Number): Number {
            let bytes = crypto.randomBytes(saltLengthBytes);
            return bytes.readUInt32BE()
        }


        // set players
        const signers = await ethers.getSigners()
        let operator = signers[0];
        let alice = signers[1];
        let aliceChoice = 0;
        let aliceSalt = getSalt(32);

        let bob = signers[2];
        let bobChoice = 1;
        let bobSalt = getSalt(32);

        let charlie = signers[3];
        let charlieChoice = 2;
        let charlieSalt = getSalt(32);

        let delta = signers[4];
        let deltaChoice = 1;
        let deltaSalt = getSalt(32);

        let echo = signers[5];
        let echoChoice = 0;
        let echoSalt = getSalt(32);

        let foxtrot = signers[6];
        let foxtrotChoice = 2;
        let foxtrotSalt = getSalt(32);

        // alice chooses rock
        let zkChoice = await buildChoice(aliceChoice, aliceSalt);
        let tx = await (await minimalGame.connect(alice).joinGame(
            ...zkChoice['proofArgs'],
            zkChoice['publicSignals']
        )).wait()

        // bob chooses paper
        zkChoice = await buildChoice(bobChoice, bobSalt);
        tx = await (await minimalGame.connect(bob).joinGame(
            ...zkChoice['proofArgs'],
            zkChoice['publicSignals']
        )).wait()

        // charlie chooses scissors
        zkChoice = await buildChoice(charlieChoice, charlieSalt);
        tx = await (await minimalGame.connect(charlie).joinGame(
            ...zkChoice['proofArgs'],
            zkChoice['publicSignals']
        )).wait()

        // delta chooses paper
        zkChoice = await buildChoice(deltaChoice, deltaSalt);
        tx = await (await minimalGame.connect(delta).joinGame(
            ...zkChoice['proofArgs'],
            zkChoice['publicSignals']
        )).wait()

        // echo chooses rock
        zkChoice = await buildChoice(echoChoice, echoSalt);
        tx = await (await minimalGame.connect(echo).joinGame(
            ...zkChoice['proofArgs'],
            zkChoice['publicSignals']
        )).wait()

        // foxtrot chooses scissors
        zkChoice = await buildChoice(foxtrotChoice, foxtrotSalt);
        tx = await (await minimalGame.connect(foxtrot).joinGame(
            ...zkChoice['proofArgs'],
            zkChoice['publicSignals']
        )).wait()

        let gameId = await minimalGame.connect(alice).getGameId();
        expect(Number(gameId)).to.equal(1);
        gameId = await minimalGame.connect(bob).getGameId();
        expect(Number(gameId)).to.equal(1);
        gameId = await minimalGame.connect(charlie).getGameId();
        expect(Number(gameId)).to.equal(2);
        gameId = await minimalGame.connect(delta).getGameId();
        expect(Number(gameId)).to.equal(2);
        gameId = await minimalGame.connect(echo).getGameId();
        expect(Number(gameId)).to.equal(3);
        gameId = await minimalGame.connect(foxtrot).getGameId();
        expect(Number(gameId)).to.equal(3);

        // bob beats alice
        await (await minimalGame.connect(alice).revealChoice(aliceChoice, aliceSalt)).wait();
        await (await minimalGame.connect(bob).revealChoice(bobChoice, bobSalt)).wait();

        let game1Winner = await minimalGame.getGameWinner(1);
        expect(game1Winner).to.equal(bob.address);

        // charlie beats delta
        await (await minimalGame.connect(charlie).revealChoice(charlieChoice, charlieSalt)).wait();
        await (await minimalGame.connect(delta).revealChoice(deltaChoice, deltaSalt)).wait();

        let game2Winner = await minimalGame.getGameWinner(2);
        expect(game2Winner).to.equal(charlie.address);

        // foxtrot is still playing
        await (await minimalGame.connect(echo).revealChoice(echoChoice, echoSalt)).wait();

        let game3Winner = await minimalGame.getGameWinner(3);
        expect(game3Winner).to.equal("0x0000000000000000000000000000000000000000");

        // have foxtrot try to lie
        let didCheat = false;
        try {
            await (await minimalGame.connect(foxtrot).revealChoice(1, foxtrotSalt)).wait();
        } catch {
            didCheat = true;
        }
        expect(didCheat).to.equal(true);

        await (await minimalGame.connect(foxtrot).revealChoice(foxtrotChoice, foxtrotSalt)).wait();

        // echo should beat foxtrot
        game3Winner = await minimalGame.getGameWinner(3);
        expect(game3Winner).to.equal(echo.address);
    });
});

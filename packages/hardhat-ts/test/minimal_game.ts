import { ethers } from 'hardhat';
import { expect } from 'chai';
import { IntegerType } from 'typechain';
const snarkjs = require('snarkjs')
const { mimcSpongecontract } = require("circomlibjs")
const fs = require('fs')
const path = require('path')
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

async function buildChoice(choice: Number) {
    let input = {
        choice: choice,
    }
    // TODO look into snarkjs generatecall

    // compute witness and run through groth16 circuit for proof / signals
    let { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        '/Users/kaneoldcastle/Desktop/oldcastlelabs/workspace/minimal-stab-ts/zk/makeChoice_js/makeChoice.wasm',
        '/Users/kaneoldcastle/Desktop/oldcastlelabs/workspace/minimal-stab-ts/zk/zkey/makeChoice_final.zkey',
    )

    const proofArgs = buildProofArgs(proof)
    const choiceVerificationKey = require('/Users/kaneoldcastle/Desktop/oldcastlelabs/workspace/minimal-stab-ts/zk/zkey/choice_verification_key.json')

    // verify proof locally
    console.log(await snarkjs.groth16.verify(
        choiceVerificationKey,
        publicSignals,
        proof
    ))
    console.log(publicSignals)

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

        // set players
        const signers = await ethers.getSigners()
        let operator = signers[0];
        let alice = signers[1];
        let aliceChoice = 0;

        let bob = signers[2];
        let bobChoice = 1;

        let charlie = signers[3];
        let charlieChoice = 2;

        let delta = signers[4];
        let deltaChoice = 1;

        let echo = signers[5];
        let echoChoice = 0;

        let foxtrot = signers[6];
        let foxtrotChoice = 2;

        // alice chooses rock
        let zkChoice = await buildChoice(aliceChoice);
        let tx = await (await minimalGame.connect(alice).joinGame(
            ...zkChoice['proofArgs'],
            zkChoice['publicSignals']
        )).wait()

        // bob chooses paper
        zkChoice = await buildChoice(bobChoice);
        tx = await (await minimalGame.connect(bob).joinGame(
            ...zkChoice['proofArgs'],
            zkChoice['publicSignals']
        )).wait()

        // charlie chooses scissors
        zkChoice = await buildChoice(charlieChoice);
        tx = await (await minimalGame.connect(charlie).joinGame(
            ...zkChoice['proofArgs'],
            zkChoice['publicSignals']
        )).wait()

        // delta chooses paper
        zkChoice = await buildChoice(deltaChoice);
        tx = await (await minimalGame.connect(delta).joinGame(
            ...zkChoice['proofArgs'],
            zkChoice['publicSignals']
        )).wait()

        // echo chooses rock
        zkChoice = await buildChoice(echoChoice);
        tx = await (await minimalGame.connect(echo).joinGame(
            ...zkChoice['proofArgs'],
            zkChoice['publicSignals']
        )).wait()

        // foxtrot chooses scissors
        zkChoice = await buildChoice(foxtrotChoice);
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
        await (await minimalGame.connect(alice).revealChoice(aliceChoice)).wait();
        await (await minimalGame.connect(bob).revealChoice(bobChoice)).wait();

        let game1Winner = await minimalGame.getGameWinner(1);
        expect(game1Winner).to.equal(bob.address);

        // charlie beats delta
        await (await minimalGame.connect(charlie).revealChoice(charlieChoice)).wait();
        await (await minimalGame.connect(delta).revealChoice(deltaChoice)).wait();

        let game2Winner = await minimalGame.getGameWinner(2);
        expect(game2Winner).to.equal(charlie.address);

        // foxtrot is still playing
        await (await minimalGame.connect(echo).revealChoice(echoChoice)).wait();

        let game3Winner = await minimalGame.getGameWinner(3);
        expect(game3Winner).to.equal("0x0000000000000000000000000000000000000000");

        // have foxtrot try to lie
        let didCheat = false;
        try {
            await (await minimalGame.connect(foxtrot).revealChoice(1)).wait();
        } catch {
            didCheat = true;
        }
        expect(didCheat).to.equal(true);

        await (await minimalGame.connect(foxtrot).revealChoice(foxtrotChoice)).wait();

        // echo should beat foxtrot
        game3Winner = await minimalGame.getGameWinner(3);
        expect(game3Winner).to.equal(echo.address);
    });
});

import { FC, useContext, useState } from 'react';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';
import { useGasPrice } from 'eth-hooks';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { Button } from 'antd';
import { CrimeSelector } from './CrimeSelector';
import { logTransactionUpdate } from '~~/components/common';

export interface IGameControlsProps {
  gameId: number
}

export const GameControls: FC<IGameControlsProps> = ({ gameId }) => {
  const ethersContext = useEthersContext();

  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersContext.chainId, 'fast');
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice);

  const crimeLabContract = useAppContracts('CrimeLab', ethersContext.chainId);

  const algoId = () => {
    var aesAlgorithmEncrypt = {
      name: "AES-CBC",
      // AesCbcParams
      iv: window.crypto.getRandomValues(new Uint8Array(16))
    };

    return aesAlgorithmEncrypt;
  }

  // From
  // https://stackoverflow.com/questions/67993979/using-javascript-web-crypto-api-to-generate-c-sharp-compatible-pbkdf2-key
  const handleReadyClick = () => {
    //
    var passphrase = new TextEncoder().encode('a sample passphrase');

    // Import passphrase
    window.crypto.subtle.importKey("raw", passphrase, { name: "PBKDF2" }, false, ["deriveBits"])
      .then(function (passphraseImported) {

        // Derive key as ArrayBuffer
        window.crypto.subtle.deriveBits(
          {
            name: "PBKDF2",
            hash: 'SHA-256',
            salt: new TextEncoder().encode('a sample salt'), // fix for testing, otherwise window.crypto.getRandomValues(new Uint8Array(16)),
            iterations: 10000
          },
          passphraseImported,
          128 // Fix!
        )
          .then(function (bits) {
            console.log("raw key:", new Uint8Array(bits)); // 7, 167, 39, 145, 34, 48, 60, 159, 242, 209, 254, 79, 78, 150, 215, 88

            // If necessary, import as CryptoKey, e.g. for encryption/decryption with AES-CBC
            window.crypto.subtle.importKey("raw", bits, { name: "AES-CBC" }, false, ["encrypt", "decrypt"])
              .then(function (cryptoKey) {
                const message = str2ab("Here is teh message");
                const aid = algoId();

                window.crypto.subtle.encrypt(aid, cryptoKey, message)
                  .then((em) => {
                    console.log("EM: ", ab2str(em));
                    window.crypto.subtle.decrypt(aid, cryptoKey, em)
                      .then((dm) => {
                        console.log("DM: ", ab2str(dm));
                      });
                  });

                console.log("CryptoKey:", cryptoKey);
              });
          });
      });
  }

  // These 2 functions from
  // https://stackoverflow.com/questions/30459767/encrypt-decrypt-between-java-and-javascript-using-web-crypto-api
  function ab2str(buf: ArrayBuffer) {
    const uint16s = new Uint16Array(buf);
    return String.fromCharCode.apply(null, Array.from(uint16s));
  }

  function str2ab(str: String) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  // inspired by
  // https://dev.to/jrgould/use-the-web-crypto-api-to-generate-a-public-private-key-pair-for-end-to-end-asymmetric-cryptography-on-the-web-2mpe
  const handleClickForBatshit = () => {
    const keyPair = crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256"
      },
      true,
      ["encrypt", "decrypt"]
    )
      .then((keyPair) => {
        console.log("BS: ", keyPair);
        if (keyPair.publicKey) {
          crypto.subtle.exportKey("jwk", keyPair.publicKey)
            .then((publicKey) => {
              console.log("PbK: ", publicKey);
            });
        }
        if (keyPair.privateKey) {
          crypto.subtle.exportKey("jwk", keyPair.privateKey)
            .then((privateKey) => {
              console.log("PvK: ", privateKey);
            });
        }
      });
  }

  // 33.1 Generate a signing key pair, sign some data
  // from
  // https://www.w3.org/TR/WebCryptoAPI/#SP800-38B
  const handleClickForCrazy = () => {
    var encoder = new TextEncoder('utf-8');

    // Algorithm Object
    var algorithmKeyGen = {
      name: "RSASSA-PKCS1-v1_5",
      // RsaHashedKeyGenParams
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),  // Equivalent to 65537
      hash: {
        name: "SHA-256"
      }
    };

    var algorithmSign = {
      name: "RSASSA-PKCS1-v1_5"
    };

    window.crypto.subtle.generateKey(algorithmKeyGen, false, ["sign"]).then(
      function (key) {
        console.log("Key: ", key);

        var dataPart1 = encoder.encode("hello,");
        var dataPart2 = encoder.encode(" world!");

        const ab = str2ab("hello");

        // NOTE this didn't work
        // return window.crypto.subtle.sign(algorithmSign, key.privateKey, [dataPart1, dataPart2]);
        return window.crypto.subtle.sign(algorithmSign, key.privateKey, ab);
      },
      console.error.bind(console, "Unable to generate a key")
    ).then(
      console.log.bind(console, "The signature is: "),
      console.error.bind(console, "Unable to sign")
    );
  }

  const handleStartGameButtonClick = async () => {
    const result = tx?.(crimeLabContract?.startGame(gameId), (update: any) => {
      logTransactionUpdate(update);
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    const unused = await result;
  }

  const handleMakeSuggestionButtonClick = async (suspect: any, weapon: any) => {
    const result = tx?.(crimeLabContract?.makeSuggestion(gameId, suspect, weapon), (update: any) => {
      logTransactionUpdate(update);
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    const unused = await result;
  }

  const handleMakeAccusationButtonClick = async (suspect: any, weapon: any) => {
    const result = tx?.(crimeLabContract?.makeAccusation(gameId, suspect, weapon), (update: any) => {
      logTransactionUpdate(update);
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    const unused = await result;
  }

  const handleEndTurnButtonClick = async () => {
    const result = tx?.(crimeLabContract?.endTurn(), (update: any) => {
      logTransactionUpdate(update);
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    const unused = await result;
  }

  const handleLeaveGameButtonClick = async () => {
    const result = tx?.(crimeLabContract?.leaveGame(), (update: any) => {
      logTransactionUpdate(update);
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    const unused = await result;
  }

  return (
    <div style={{ border: "1px solid" }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-evenly',
          flexWrap: 'wrap',
          gap: 8,
          padding: 8,
        }}
      >
        <Button onClick={handleClickForBatshit}>
          Batshit
        </Button>
        <Button onClick={handleClickForCrazy}>
          Crazy
        </Button>
        <Button onClick={handleReadyClick}>
          Ready
        </Button>
        <Button onClick={handleStartGameButtonClick}>
          Start Game
        </Button>
        <CrimeSelector guessType="Suggestion" submitHandler={handleMakeSuggestionButtonClick} />
        <CrimeSelector guessType="Accusation" submitHandler={handleMakeAccusationButtonClick} />
        <Button onClick={handleEndTurnButtonClick}>
          End Turn
        </Button>
        <Button onClick={handleLeaveGameButtonClick}>
          Leave Game
        </Button>
      </div>
    </div>
  )
}

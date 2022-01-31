import { FC, useContext } from 'react';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';
import { useGasPrice } from 'eth-hooks';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { Button } from 'antd';
import { logTransactionUpdate } from '~~/components/common';

// const handleStartGameButtonClick = async () => {
//   const result = tx?.(crimeLabContract?.startGame(game), (update: any) => {
//     logTransactionUpdate(update);
//   });
//   console.log("awaiting metamask/web3 confirm result...", result);
//   const unused = await result;
// }

export interface IGameControlsProps {
}

export const GameControls: FC<IGameControlsProps> = () => {
  const ethersContext = useEthersContext();

  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersContext.chainId, 'fast');
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice);

  const crimeLabContract = useAppContracts('CrimeLab', ethersContext.chainId);

  const handleEndTurnButtonClick = async () => {
    const result = tx?.(crimeLabContract?.endTurn(), (update: any) => {
      logTransactionUpdate(update);
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    const unused = await result;
  }

  return (
    <div style={{ border: "1px solid" }}>
      <div style={{ display: 'flex', justifyContent: 'space-evenly', }}>
        <Button disabled>
          Ready
        </Button>
        <Button disabled>
          Start Game
        </Button>
        <Button onClick={handleEndTurnButtonClick}>
          End Turn
        </Button>
        <Button disabled>
          Make Suggestion
        </Button>
        <Button disabled>
          Make Accusation
        </Button>
        <Button disabled>
          Quit Game
        </Button>
      </div>
    </div>
  )
}
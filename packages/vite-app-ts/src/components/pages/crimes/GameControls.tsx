import { FC, useContext } from 'react';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';
import { useGasPrice } from 'eth-hooks';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { Button } from 'antd';
import { logTransactionUpdate } from '~~/components/common';
import { CrimeLab } from '~~/generated/contract-types';

export interface IGameControlsProps {
  gameId: number
}

export const GameControls: FC<IGameControlsProps> = ({ gameId }) => {
  const ethersContext = useEthersContext();

  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersContext.chainId, 'fast');
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice);

  const crimeLabContract = useAppContracts('CrimeLab', ethersContext.chainId);

  const handleStartGameButtonClick = async () => {
    const result = tx?.(crimeLabContract?.startGame(gameId), (update: any) => {
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
      <div style={{ display: 'flex', justifyContent: 'space-evenly', }}>
        <Button disabled>
          Ready
        </Button>
        <Button onClick={handleStartGameButtonClick}>
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
        <Button onClick={handleLeaveGameButtonClick}>
          Leave Game
        </Button>
      </div>
    </div>
  )
}
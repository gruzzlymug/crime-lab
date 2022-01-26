import { FC, useContext, useState } from 'react';
import { Redirect } from "react-router-dom";
import { useContractReader, useEventListener, useGasPrice } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { Button, Input, List } from 'antd';
import { Address } from 'eth-components/ant';
import { Players } from './Players'
import { GameCreatedEvent } from '~~/generated/contract-types/CrimeLab';
import { logTransactionUpdate } from '~~/components/common';

export interface ILobbyProps {
}

export const Lobby: FC<ILobbyProps> = () => {
  const ethersContext = useEthersContext();
  const crimeLabContract = useAppContracts('CrimeLab', ethersContext.chainId);
  const [newGameName, setNewGameName] = useState("");

  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersContext.chainId, 'fast');
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice);

  const [gameId] = useContractReader(crimeLabContract, crimeLabContract?.getGameId, []);

  const [gameCreatedEvents] = useEventListener<GameCreatedEvent>(crimeLabContract, crimeLabContract?.filters.GameCreated(), 1);

  const handleCreateButtonClick = async () => {
    const result = tx?.(crimeLabContract?.createGame(newGameName), (update: any) => {
      logTransactionUpdate(update);
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    const unused = await result;
  }

  const handleJoinButtonClick = async () => {
    const result = tx?.(crimeLabContract?.joinAnyGame(), (update: any) => {
      logTransactionUpdate(update);
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    const unused = await result;
  }

  return (
    <div style={{ margin: 8 }}>
      {(gameId && (gameId.toNumber() > 0)) && <Redirect to={`/crime/${gameId}`} />}
      <div>
        <Input
          placeholder={"Game name"}
          onChange={e => { setNewGameName(e.target.value); }}
        />
        <Button
          style={{ marginTop: 8 }}
          onClick={handleCreateButtonClick}
        >
          Create new game
        </Button>
      </div>
      <div>
        <Button
          style={{ marginTop: 8 }}
          onClick={handleJoinButtonClick}
        >
          Join Game
        </Button>
      </div>

      <div style={{ width: 600, margin: 'auto', marginTop: 32, paddingBottom: 32 }}>
        <h2>Events:</h2>
        <List
          bordered
          dataSource={gameCreatedEvents}
          renderItem={(item: any) => {
            const gameId = item.args[0].toNumber();
            const gameName = item.args[1];
            const address = item.args[2];

            return (
              <List.Item key={item.blockNumber + '_' + address + '_' + gameName}>
                <Address address={address} ensProvider={undefined} fontSize={16} />
                &nbsp;
                =&gt;
                &nbsp;{item.event}: {gameName} {gameId}
                <Players gameId={gameId} />
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
}
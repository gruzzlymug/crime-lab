import { FC, useContext, useState } from 'react';
import { Redirect, Link } from "react-router-dom";
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
import { BigNumber } from 'ethers';

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

  const handleJoinAnyGameButtonClick = async () => {
    const result = tx?.(crimeLabContract?.joinAnyGame(), (update: any) => {
      logTransactionUpdate(update);
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    const unused = await result;
  }
  const joinGame = (gameId: number) => async () => {
    const result = tx?.(crimeLabContract?.joinGame(BigNumber.from(gameId)), (update: any) => {
      logTransactionUpdate(update);
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    const unused = await result;
  }

  return (
    <div style={{ margin: 8 }}>
      {(gameId && (gameId.toNumber() > 0)) && <Redirect to={`/${gameId}`} />}
      <div>
        <Input.Group compact style={{ marginTop: 24 }}>
          <Input
            placeholder={"Game name"}
            onChange={e => { setNewGameName(e.target.value); }}
            style={{ width: '50%' }}
          />
          <Button
            type='primary'
            onClick={handleCreateButtonClick}
            disabled={!newGameName}
          >
            Create new game
          </Button>
        </Input.Group>
      </div>
      <div>
        <Button
          style={{ marginTop: 18, width: '30%', minWidth: 180 }}
          onClick={handleJoinAnyGameButtonClick}
        >
          Join Random Game
        </Button>
      </div>

      <div style={{ margin: 'auto', marginTop: 32, paddingBottom: 32 }}>
        <h2>Events:</h2>
        <List
          bordered
          dataSource={gameCreatedEvents}
          renderItem={(item: any) => {
            const gameId = item.args[0].toNumber();
            const gameName = item.args[1];
            const address = item.args[2];

            return (
              <List.Item
                key={item.blockNumber + '_' + address + '_' + gameName}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: 8 }}>
                  <div>
                    <Address address={address} ensProvider={undefined} fontSize={16} />
                  </div>
                  <div>
                    {`=>`}
                  </div>
                  <div>
                    {item.event}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-evenly', gap: 12, margin: 8 }}>
                  <Link to={`/${gameId}`}>
                    <Button>
                      Go&nbsp;to&nbsp;game:&nbsp;{gameName}
                    </Button>
                  </Link>
                  <Button onClick={joinGame(gameId)}>
                    Join Game {gameId}
                  </Button>
                </div>
                <Players gameId={gameId} />
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
}

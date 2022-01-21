import { FC, useContext, useState } from 'react';
import { Redirect } from "react-router-dom";
import { useContractReader, useEventListener, useGasPrice } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { Players } from './Players'
import { JoinGameButton } from "./JoinGameButton";

import { Button, Input, List } from 'antd';
import { Address } from 'eth-components/ant';
import { GameCreatedEvent } from '~~/generated/contract-types/CrimeLab';

export interface ICrimeLabProps {
}

export const CrimeLab: FC<ICrimeLabProps> = (props) => {
  const ethersContext = useEthersContext();
  const crimeLabContract = useAppContracts('CrimeLab', ethersContext.chainId);
  const [newGameName, setNewGameName] = useState("");

  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersContext.chainId, 'fast');
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice);

  const [gameId] = useContractReader(crimeLabContract, crimeLabContract?.getGameId, []);

  const [gameCreatedEvents] = useEventListener<GameCreatedEvent>(crimeLabContract, crimeLabContract?.filters.GameCreated(), 1);

  return (
    <div style={{ margin: 8 }}>
      {(gameId && (gameId.toNumber() > 0)) && <Redirect to={`/crime/${gameId}`} />}
      <Input
        placeholder={"Game name"}
        onChange={e => {
          setNewGameName(e.target.value);
        }}
      />
      <Button
        style={{ marginTop: 8 }}
        onClick={async () => {
          const result = tx?.(crimeLabContract?.createGame(newGameName), (update: any) => {
            console.log("📡 Transaction Update:", update);
            if (update && (update.status === "confirmed" || update.status === 1)) {
              console.log(" 🍾 Transaction " + update.hash + " finished!");
              console.log(
                " ⛽️ " +
                update.gasUsed +
                "/" +
                (update.gasLimit || update.gas) +
                " @ " +
                parseFloat(update.gasPrice) / 1000000000 +
                " gwei",
              );
            }
          });
          console.log("awaiting metamask/web3 confirm result...", result);
          const newGame = await result;

          // TODO - need to figure out how to get the gameId of the newly created game.
          console.log("new game: ", newGame);
          // debugger;
          const newGameId = newGame?.value.toNumber();
          console.log("newGameId", newGameId);
          // debugger;

          // TEMP commenting out the code to redirect the user to the game,
          // until we have the gameId for the newly created game.
          // setGameId(newGameId);
          // setGoToGame(true);
        }}
      >
        Create new game
      </Button>
      <JoinGameButton tx={tx} />

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
import { FC } from 'react';
import { useEffect, useState } from 'react';
import { useContractReader, useEventListener } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';
import { Checkbox } from 'antd';
import { Board } from './Board';
import { BigNumber } from 'ethers';

export interface ICrimeProps {
}

interface PlayerProps {
  id: string,
  ready: boolean,
  position: BigNumber
}

function formatAddress(address: string) {
  return address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length);
}

function padNumber(n: BigNumber) {
  return (n.toNumber() < 10 ? '0' : '') + n.toNumber()
}

export const Crime: FC<ICrimeProps> = () => {
  const ethersContext = useEthersContext();
  const crimeLabContract = useAppContracts('CrimeLab', ethersContext.chainId);

  const [gameId] = useContractReader(crimeLabContract, crimeLabContract?.getGameId, []);
  const [gameName] = useContractReader(crimeLabContract, crimeLabContract?.getName, [gameId || 0]);
  // this is updated whenever the 'PlayerJoined' event is emitted
  const [numPlayers] = useContractReader(crimeLabContract, crimeLabContract?.getNumPlayers, [gameId || 0], crimeLabContract?.filters.PlayerJoined());
  const [gameTurn] = useContractReader(crimeLabContract, crimeLabContract?.getTurn, [gameId || 0], crimeLabContract?.filters.TurnTaken());

  // this is updated via a sideEffect below.
  const [players, setPlayers] = useState<PlayerProps[]>([]);

  useEffect(() => {
    const getPlayers = async () => {
      const nop = numPlayers && numPlayers.toNumber() || 0;
      const gid = gameId && gameId.toNumber() || 0;
      let players = [];
      for (let i: number = 0; i < nop; i++) {
        const player = await crimeLabContract?.game_to_players(gid, i);
        if (player) {
          players.push(player);
        }
      }
      setPlayers(players);
    };
    getPlayers();
  }, [numPlayers]);

  return (
    <div>
      <div>
        CRIME: {gameName}
      </div>
      <div>
        GAME ID: {gameId?.toNumber()}
      </div>
      <div>
        TURN: {gameTurn?.toNumber()}
      </div>
      <div>
        {numPlayers?.toNumber()} PLAYERS
        {players.map(player => {
          return (
            <div key={player.id}>
              <Checkbox checked={player.ready} disabled />&nbsp;
              {formatAddress(player.id)} @ {padNumber(player.position)}
            </div>
          )
        })}
      </div>
      <Board players={players} />
    </div>
  )
}
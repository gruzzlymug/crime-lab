import { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
// NOTE maybe need for game id
// import { useParams } from "react-router-dom";
import { useContractReader, useEventListener } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';

import { Players } from './Players'
import { Board } from './Board';

import { BigNumber } from 'ethers';

// TODO figure out "best" way to get game id
export interface ICrimeProps {
}

type GameParams = {
  gameId: string;
};

export const Crime: FC<ICrimeProps> = () => {
  const ethersContext = useEthersContext();
  const crimeLabContract = useAppContracts('CrimeLab', ethersContext.chainId);

  const [contractGameId] = useContractReader(crimeLabContract, crimeLabContract?.getGameId, []);

  const [gameId, setGameId] = useState(contractGameId);
  const [players, setPlayers] = useState(new Set<string>());

  // const { gameId } = useParams<GameParams>();

  const [gameName] = useContractReader(crimeLabContract, crimeLabContract?.getName, [gameId || 0], crimeLabContract?.filters.GameCreated());
  const [numberOfPlayers] = useContractReader(crimeLabContract, crimeLabContract?.getNumPlayers, [gameId || 0]);

  useEffect(() => {
    const getPlayers = async () => {
      const nop = numberOfPlayers && numberOfPlayers.toNumber() || 0;
      const gid = gameId && gameId.toNumber() || 0;
      let players = new Set<string>();
      for (let i: number = 0; i < nop; i++) {
        const player = await crimeLabContract?.game_to_players(gid, i);
        if (player) {
          players.add(player);
        }
      }
      setPlayers(players);
    };
    getPlayers();
  }, [gameId]);

  return (
    <div>
      <div>
        CRIME {gameName} {numberOfPlayers?.toNumber()}
      </div>
      <div>
        PLAYERS {players.size} {Array.from(players, e => { return (<div key={e}>{e}</div>) })}
      </div>
      <Board />
    </div>
  )
}
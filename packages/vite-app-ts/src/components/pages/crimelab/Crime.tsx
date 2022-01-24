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

  const [gameId] = useContractReader(crimeLabContract, crimeLabContract?.getGameId, []);
  const [gameName] = useContractReader(crimeLabContract, crimeLabContract?.getName, [gameId || 0]);
  // this is updated whenever the 'PlayerJoined' event is emitted
  const [numberOfPlayers] = useContractReader(crimeLabContract, crimeLabContract?.getNumPlayers, [gameId || 0], crimeLabContract?.filters.PlayerJoined());

  // this is updated via a sideEffect below.
  const [players, setPlayers] = useState(new Set<string>());

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
  }, [numberOfPlayers]);

  return (
    <div>
      <div>
        CRIME: {gameName}
      </div>
      <div>
        GAME ID: {gameId?.toNumber()}
      </div>
      <div>
        {numberOfPlayers?.toNumber()} PLAYERS {Array.from(players, e => { return (<div key={e}>{e}</div>) })}
      </div>
      <Board />
    </div>
  )
}
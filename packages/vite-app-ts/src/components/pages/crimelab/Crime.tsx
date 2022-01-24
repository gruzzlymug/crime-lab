import { FC } from 'react';
import { useEffect, useState } from 'react';
import { useContractReader, useEventListener } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';
import { Checkbox } from 'antd';
import { Board } from './Board';

export interface ICrimeProps {
}

export const Crime: FC<ICrimeProps> = () => {
  const ethersContext = useEthersContext();
  const crimeLabContract = useAppContracts('CrimeLab', ethersContext.chainId);

  const [gameId] = useContractReader(crimeLabContract, crimeLabContract?.getGameId, []);
  const [gameName] = useContractReader(crimeLabContract, crimeLabContract?.getName, [gameId || 0]);
  // this is updated whenever the 'PlayerJoined' event is emitted
  const [numberOfPlayers] = useContractReader(crimeLabContract, crimeLabContract?.getNumPlayers, [gameId || 0], crimeLabContract?.filters.PlayerJoined());

  // this is updated via a sideEffect below.
  const [players, setPlayers] = useState<{ id: string; ready: boolean; }[]>([]);
  const [turn, setTurn] = useState(0);

  useEffect(() => {
    const getPlayers = async () => {
      const nop = numberOfPlayers && numberOfPlayers.toNumber() || 0;
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
  }, [numberOfPlayers]);

  useEffect(() => {
    const getTurn = async () => {
      const gid = gameId && gameId.toNumber() || 0;
      const game = await crimeLabContract?.games(gid);
      if (game) {
        setTurn(game.turn.toNumber());
      }
    }
    getTurn();
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
        TURN: {turn}
      </div>
      <div>
        {numberOfPlayers?.toNumber()} PLAYERS
        {players.map(player => {
          return (
            <div key={player.id}><Checkbox checked={player.ready} disabled /> {player.id}</div>
          )
        })}
      </div>
      <Board />
    </div>
  )
}
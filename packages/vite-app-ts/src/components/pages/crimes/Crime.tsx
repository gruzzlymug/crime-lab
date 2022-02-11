import { FC, useEffect, useState } from 'react';
import { useContractReader, useEventListener } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';
import { BigNumber } from 'ethers';
import { Board } from './Board';
import { PlayingCards } from './PlayingCards';
import { GameStatus } from './GameStatus';
import { GameControls } from './GameControls';

export interface ICrimeProps {
}

// TODO ¡¡¡this is pasted in Status.tsx!!!
interface PlayerProps {
  id: string,
  ready: boolean,
  position: BigNumber
}

export const Crime: FC<ICrimeProps> = () => {
  const ethersContext = useEthersContext();
  const crimeLabContract = useAppContracts('CrimeLab', ethersContext.chainId);

  const [gameId] = useContractReader(crimeLabContract, crimeLabContract?.getGameId, []);
  const [gameName] = useContractReader(crimeLabContract, crimeLabContract?.getName, [gameId || 0]);
  const [numPlayers] = useContractReader(crimeLabContract, crimeLabContract?.getNumPlayers, [gameId || 0], crimeLabContract?.filters.PlayerJoined());
  const [playerMoved] = useContractReader(crimeLabContract, crimeLabContract?.getPlayerMoved, [gameId || 0], crimeLabContract?.filters.PlayerMoved());
  const [gameTurn] = useContractReader(crimeLabContract, crimeLabContract?.getTurn, [gameId || 0], crimeLabContract?.filters.TurnTaken());
  const [hand] = useContractReader(crimeLabContract, crimeLabContract?.getHand, [], crimeLabContract?.filters.CardDiscarded());
  const [discardPile] = useContractReader(crimeLabContract, crimeLabContract?.getDiscardPile, [], crimeLabContract?.filters.CardDiscarded());
  const [dieRoll] = useContractReader(crimeLabContract, crimeLabContract?.getDieRoll, [], crimeLabContract?.filters.DieRolled());

  // TODO may want multiple events to trigger this...refine
  const [map] = useContractReader(crimeLabContract, crimeLabContract?.getMap, [], crimeLabContract?.filters.PlayerMoved());

  // NOTE players array not needed for map display anymore
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
  }, [numPlayers, playerMoved, gameTurn]);

  const turn = gameTurn?.toNumber() || 0;
  const activePlayerIndex = turn % (numPlayers?.toNumber() || 0);

  let sortedHand: Array<number> = [];
  if (hand) {
    sortedHand = hand.map(card => { return card.toNumber() }).sort((a, b) => { return a - b });
  }

  return (
    <div>
      <GameStatus
        gameId={gameId?.toNumber() || 0}
        gameName={gameName || '** no game **'}
        turn={turn}
        players={players}
        activePlayerIndex={activePlayerIndex}
        hand={sortedHand}
        dieRoll={dieRoll?.toNumber() || 0}
      />
      <GameControls
        gameId={gameId?.toNumber() || 0}
      />
      <Board
        cells={map || []}
      />
      <PlayingCards hand={sortedHand} />
    </div>
  )
}

import { FC, useEffect, useState } from 'react';
import { useContractReader, useEventListener } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';
import { Checkbox } from 'antd';
import { Board } from './Board';
import { BigNumber } from 'ethers';
import { formatAddress } from '~~/components/common';

export interface ICrimeProps {
}

interface PlayerProps {
  id: string,
  ready: boolean,
  position: BigNumber
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
  const [playerMoved] = useContractReader(crimeLabContract, crimeLabContract?.getPlayerMoved, [gameId || 0], crimeLabContract?.filters.PlayerMoved());
  const [gameTurn] = useContractReader(crimeLabContract, crimeLabContract?.getTurn, [gameId || 0], crimeLabContract?.filters.TurnTaken());
  const [hand] = useContractReader(crimeLabContract, crimeLabContract?.getHand, [], crimeLabContract?.filters.CardDiscarded());
  const [discardPile] = useContractReader(crimeLabContract, crimeLabContract?.getDiscardPile, [], crimeLabContract?.filters.CardDiscarded());

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

  const sortedHand = hand?.map((card) => { return card.toNumber() }).sort((a, b) => { return a - b });

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
        {numPlayers?.toNumber()} PLAYERS
        {players.map((player, index) => {
          return (
            <div key={player.id}>
              {turn === 0
                ? <Checkbox checked={player.ready} disabled />
                : (index === activePlayerIndex) ? '➜' : '\xa0\xa0\xa0'}
              &nbsp;
              {formatAddress(player.id)} @ {padNumber(player.position)}
            </div>
          )
        })}
      </div>
      <div>YOUR HAND: {sortedHand && sortedHand?.length > 0 ? sortedHand?.map((card) => { return card + " " }) : "No Cards"}</div>
      <Board players={players} />
    </div>
  )
}
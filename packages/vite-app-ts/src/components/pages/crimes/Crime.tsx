import { FC, useEffect, useState } from 'react';
import { useContractReader, useEventListener } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';
import { Checkbox, Typography, Statistic } from 'antd';
const { Title, Text } = Typography

import { Board } from './Board';
import { PlayingCards } from './PlayingCards';
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

  let sortedHand: Array<number> = [];
  if (hand) {
    sortedHand = hand.map(card => { return card.toNumber() }).sort((a, b) => { return a - b });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-evenly', }}>
        <div>
          <div>
            <Text type="secondary">crime:</Text>
            <Title level={3} style={{ marginTop: 0 }}>{gameName}</Title>
          </div>
          <Statistic title="gameId:" value={gameId?.toNumber()} precision={0} />
        </div>
        <div>
          <Statistic title="turn" value={turn} precision={0} />
        </div>
        <div>
          <Statistic title="players" value={numPlayers?.toNumber()} precision={0} />
        </div>
        <div>
          <Text type="secondary">Players</Text>
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
        <div>
          <Text type="secondary">Your hand</Text>
          <Title level={3} style={{ marginTop: 0 }}>
            {sortedHand.length > 0 ? sortedHand.map((card) => { return card + " " }) : "no cards"}
          </Title>
        </div>
      </div>
      <Board players={players} />
      <PlayingCards hand={sortedHand} />
    </div>
  )
}

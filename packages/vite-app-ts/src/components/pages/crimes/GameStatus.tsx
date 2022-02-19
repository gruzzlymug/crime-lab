import { FC } from 'react';
import { Checkbox, Typography, Statistic } from 'antd';
import { formatAddress, padNumber } from '~~/components/common';

const { Title, Text } = Typography

// TODO ¡¡¡this is copy/pasted from Crime.tsx!!!
import { BigNumber } from 'ethers';
interface PlayerProps {
  id: string,
  ready: boolean,
  position: BigNumber
}

export interface IGameStatusProps {
  gameId: number,
  gameName: string,
  turn: number,
  players: PlayerProps[],
  activePlayerIndex: number,
  hand: Array<number>,
  dieRoll: number
}

export const GameStatus: FC<IGameStatusProps> = ({ gameId, gameName, turn, players, activePlayerIndex, hand, dieRoll }) => {
  const numPlayers = players.length;

  const cardCodes = [
    'XX',
    ':M', ':S', ':P', ':G', ':W', ':K',
    '¡r', '¡p', '¡k', '¡w', '¡c', '¡v',
    '.B', '.S', '.H', '.L', '.D', '.R', '.C', '.Y', '.K'
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-evenly', flexWrap: 'wrap', marginTop: 18 }}>
        <div>
          <div>
            <Text type="secondary">crime:</Text>
            <Title level={3} style={{ marginTop: 0 }}>{gameName}</Title>
          </div>
          <Statistic title="gameId:" value={gameId} precision={0} />
        </div>
        <div>
          <Statistic title="turn" value={turn} precision={0} />
          <Statistic title="die roll" value={dieRoll} precision={0} />
        </div>
        <div>
          <Statistic title="players" value={numPlayers} precision={0} />
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
                {formatAddress(player.id)} @ {padNumber(player.position.toNumber())}
              </div>
            )
          })}
        </div>
        <div>
          <Text type="secondary">Your hand</Text>
          <Title level={3} style={{ marginTop: 0 }}>
            {hand.length > 0 ? hand.map((card) => { return cardCodes[card] + " " }) : "no cards"}
          </Title>
        </div>
      </div>
    </div>
  )
}

import React from 'react';
import { FC } from 'react';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';
import { useContractReader } from 'eth-hooks';
import { Button, Input, List } from 'antd';
import { Address } from 'eth-components/ant';

export interface IPlayersProps {
  gameId: BigInteger
}

export const Players: FC<IPlayersProps> = (props) => {
  const ethersContext = useEthersContext();
  const crimeLabContract = useAppContracts('CrimeLab', ethersContext.chainId);
  const [numberOfPlayers] = useContractReader(crimeLabContract, crimeLabContract?.getNumPlayers, [props.gameId], crimeLabContract?.filters.PlayerJoined());
  const [players, setPlayers] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    const fetchPlayers = async (gameId: BigInteger, numberOfPlayers: number) => {
      for (var i: number = 0; i < numberOfPlayers || 0; i++) {
        const player: any = await crimeLabContract?.game_to_players(gameId, i);
        players.add(player)
      }
      setPlayers(players);
    };
    fetchPlayers(props.gameId, numberOfPlayers?.toNumber() || 0);
  }, [numberOfPlayers]);

  return (
    <div>
      <h3>Players</h3>
      <List
        bordered
        dataSource={Array.from(players.values())}
        renderItem={(item: any) => {
          return (
            <List.Item >
              {item}
            </List.Item>
          );
        }}
      />
    </div>
  );
}
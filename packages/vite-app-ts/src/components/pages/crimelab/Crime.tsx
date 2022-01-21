import { FC } from 'react';
// NOTE maybe need for game id
// import { useParams } from "react-router-dom";
import { useContractReader, useEventListener } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';

import { Players } from './Players'
import { BigNumber } from 'ethers';

// TODO figure out "best" way to get game id
export interface ICrimeProps {
  gameId: Number
}

export const Crime: FC<ICrimeProps> = ({ gameId }) => {
  const ethersContext = useEthersContext();
  const crimeLabContract = useAppContracts('CrimeLab', ethersContext.chainId);

  const [realGameId] = useContractReader(crimeLabContract, crimeLabContract?.getGameId, []);
  const [gameName] = useContractReader(crimeLabContract, crimeLabContract?.getName, [realGameId || 0], crimeLabContract?.filters.GameCreated());

  const finalGameId: number = realGameId && realGameId.toNumber() || 0;

  return (
    <div>
      CRIME {gameName}
      <Players gameId={new Uint8Array(finalGameId)} />
    </div>
  )
}
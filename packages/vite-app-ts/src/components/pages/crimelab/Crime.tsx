import { FC } from 'react';
// TODO WIP
// import { useParams } from "react-router-dom";
// import { useContractReader, useEventListener } from 'eth-hooks';
// import { useEthersContext } from 'eth-hooks/context';
// import { useAppContracts } from '~~/config/contractContext';

export interface ICrimeProps {
  gameId: Number
}

export const Crime: FC<ICrimeProps> = ({ gameId }) => {
  // const ethersContext = useEthersContext();
  // const crimeLabContract = useAppContracts('CrimeLab', ethersContext.chainId);
  console.log("WE HAVE ARRIVED: " + gameId);

  // const [gameName] = useContractReader(crimeLabContract, crimeLabContract?.getName, [gameId || 0], crimeLabContract?.filters.GameCreated());

  return (
    <div>
      CRIME
    </div>
  )
}
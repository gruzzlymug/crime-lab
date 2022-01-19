import { FC } from 'react';
import { GenericContract } from 'eth-components/ant/generic-contract';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';

export interface ICrimesProps {
}

export const Crimes: FC<ICrimesProps> = (props) => {
  const ethersContext = useEthersContext();
  const crimeLabContract = useAppContracts('CrimeLab', ethersContext.chainId);

  return (
    <div>
      <GenericContract
        contractName="CrimeLab"
        contract={crimeLabContract}
        mainnetAdaptor={undefined}
        blockExplorer={"undefined"}
      />
    </div>
  );
}
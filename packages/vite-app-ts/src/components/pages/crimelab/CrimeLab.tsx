import { FC } from 'react';
import { GenericContract } from 'eth-components/ant/generic-contract';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';

export interface ICrimeLabProps {
}

export const CrimeLab: FC<ICrimeLabProps> = (props) => {
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
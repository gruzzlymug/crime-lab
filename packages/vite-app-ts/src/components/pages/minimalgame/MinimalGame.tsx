import { FC } from 'react';
import { GenericContract } from 'eth-components/ant/generic-contract';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';

export interface IMinimalGameProps {
}

export const MinimalGame: FC<IMinimalGameProps> = (props) => {
  const ethersContext = useEthersContext();
  const minimalGameContract = useAppContracts('MinimalGame', ethersContext.chainId);

  return (
    <div>
      <GenericContract
        contractName="MinimalGame"
        contract={minimalGameContract}
        mainnetAdaptor={undefined}
        blockExplorer={"undefined"}
      />
    </div>
  );
}
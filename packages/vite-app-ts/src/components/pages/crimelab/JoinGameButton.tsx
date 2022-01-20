import React from 'react';
import { FC } from 'react';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';
import { useContractReader } from 'eth-hooks';
import { Button, Input, List } from 'antd';
import { Address } from 'eth-components/ant';
import { TTransactorFunc } from 'eth-components/functions';

export interface IJoinGameButtonProps {
  tx: TTransactorFunc | undefined
}

export const JoinGameButton: FC<IJoinGameButtonProps> = (props) => {
  const ethersContext = useEthersContext();
  const crimeLabContract = useAppContracts('CrimeLab', ethersContext.chainId);

  return (
    <div>
      <Button
        style={{ marginTop: 8 }}
        onClick={async () => {
          const result = props.tx?.(crimeLabContract?.joinAnyGame(), (update: any) => {
            console.log("📡 Transaction Update:", update);
            if (update && (update.status === "confirmed" || update.status === 1)) {
              console.log(" 🍾 Transaction " + update.hash + " finished!");
              console.log(
                " ⛽️ " +
                update.gasUsed +
                "/" +
                (update.gasLimit || update.gas) +
                " @ " +
                parseFloat(update.gasPrice) / 1000000000 +
                " gwei",
              );
            }
          });
          console.log("awaiting metamask/web3 confirm result...", result);
          const res = await result;
          console.log("res: ", res);

        }}
      >
        Join Game
      </Button>
    </div>
  );
}

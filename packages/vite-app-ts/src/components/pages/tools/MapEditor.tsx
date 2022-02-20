import { FC, useContext, useState } from 'react';
import { useGasPrice } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '~~/config/contractContext';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { Button, Input } from 'antd';
import { logTransactionUpdate } from '~~/components/common';

export interface IMapEditorProps {
}

export const MapEditor: FC<IMapEditorProps> = () => {
  const ethersContext = useEthersContext();
  const mintedMapContract = useAppContracts('MintedMap', ethersContext.chainId);

  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersContext.chainId, 'fast');
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice);

  const [recipientAddress, setRecipientAddress] = useState("");

  const handleCreateButtonClick = async () => {
    const result = tx?.(mintedMapContract?.safeMint(recipientAddress), (update: any) => {
      logTransactionUpdate(update);
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    const unused = await result;
  }

  return (
    <div>
      <Input.Group compact style={{ marginTop: 24 }}>
        <Input
          placeholder={"Recipient Address"}
          onChange={e => { setRecipientAddress(e.target.value); }}
          style={{ width: '50%' }}
        />
        <Button
          type='primary'
          onClick={handleCreateButtonClick}
          disabled={!recipientAddress}
        >
          Mint NFT
        </Button>
      </Input.Group>
    </div>
  )
}
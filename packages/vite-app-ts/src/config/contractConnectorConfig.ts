import * as hardhatContracts from '~~/generated/contract-types';
import { externalContractsAddressMap } from './externalContractsConfig';
import * as externalContracts from '~~/generated/external-contracts/esm/types';
import hardhatContractsJson from '../generated/hardhat_contracts.json';
import {
  createConnectorForExternalAbi,
  createConnectorForExternalContract,
  createConnectorForHardhatContract,
} from 'eth-hooks/context';

/**
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * ### Instructions
 * 1. edit externalContractList.ts to add your external contract addresses.
 * 2. edit `loader` function below and add them to the list
 * 3. run yarn compile `yarn build:contracts` to generate types for contracts
 * 4. run `yarn deploy` to generate hardhat_contracts.json
 *
 * ### Summary
 * - called  by useAppContracts
 * @returns
 */
export const contractConnectorConfig = () => {
  try {
    const result = {
      // 🙋🏽‍♂️ Add your hardhat contracts here
      YourContract: createConnectorForHardhatContract(
        'YourContract',
        hardhatContracts.YourContract__factory,
        hardhatContractsJson
      ),
      CrimeLab: createConnectorForHardhatContract(
        'CrimeLab',
        hardhatContracts.CrimeLab__factory,
        hardhatContractsJson
      ),
      MinimalGame: createConnectorForHardhatContract(
        'MinimalGame',
        hardhatContracts.MinimalGame__factory,
        hardhatContractsJson
      ),
      MintedMap: createConnectorForHardhatContract(
        'MintedMap',
        hardhatContracts.MintedMap__factory,
        hardhatContractsJson
      ),

      // 🙋🏽‍♂️ Add your external contracts here, make sure to define the address in `externalContractsConfig.ts`
      DAI: createConnectorForExternalContract('DAI', externalContracts.DAI__factory, externalContractsAddressMap),
      UNI: createConnectorForExternalContract('UNI', externalContracts.UNI__factory, externalContractsAddressMap),
      LOOT: createConnectorForExternalContract('LOOT', externalContracts.LOOT__factory, externalContractsAddressMap),

      // 🙋🏽‍♂️ Add your external abi here (unverified contracts)`
      // DAI: createConnectorForExternalAbi('DAI', { 1: {address: 'xxxx'}}, abi),
    } as const;

    return result;
  } catch (e) {
    console.error(
      '❌ contractConnectorConfig: ERROR with loading contracts please run `yarn contracts:build or yarn contracts:rebuild`.  Then run `yarn deploy`!',
      e
    );
  }

  return undefined;
};

/**
 * ### Summary
 * This type describes all your contracts, it is the return of {@link contractConnectorConfig}
 */
export type TAppConnectorList = NonNullable<ReturnType<typeof contractConnectorConfig>>;

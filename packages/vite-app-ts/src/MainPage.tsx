import React, { FC, useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import '~~/styles/main-page.css';
import { useContractReader, useBalance, useEthersAdaptorFromProviderOrSigners } from 'eth-hooks';
import { useDexEthPrice } from 'eth-hooks/dapps';

import { GenericContract } from 'eth-components/ant/generic-contract';
import { MinimalGame } from '~~/components/pages';

import { useEventListener } from 'eth-hooks';
import { MainPageMenu, MainPageContracts, MainPageFooter, MainPageHeader } from './components/main';
import { useScaffoldProviders as useScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import { useBurnerFallback } from '~~/components/main/hooks/useBurnerFallback';
import { useScaffoldHooksExamples as useScaffoldHooksExamples } from './components/main/hooks/useScaffoldHooksExamples';
import { useEthersContext } from 'eth-hooks/context';
import { NETWORKS } from '~~/models/constants/networks';
import { const_UseBurnerWalletAsFallback, mainnetProvider } from '~~/config/providersConfig';
import {
  useAppContracts,
  useAppContractsActions,
  useConnectAppContracts,
  useLoadAppContracts,
} from '~~/config/contractContext';
import { asEthersAdaptor } from 'eth-hooks/functions';
import { subgraphUri } from '~~/config/subgraphConfig';

export const Main: FC = () => {
  // -----------------------------
  // Providers, signers & wallets
  // -----------------------------
  // 🛰 providers
  // see useLoadProviders.ts for everything to do with loading the right providers
  const scaffoldAppProviders = useScaffoldAppProviders();

  // 🦊 Get your web3 ethers context from current providers
  const ethersContext = useEthersContext();

  // if no user is found use a burner wallet on localhost as fallback if enabled
  useBurnerFallback(scaffoldAppProviders, const_UseBurnerWalletAsFallback);

  // -----------------------------
  // Load Contracts
  // -----------------------------
  // 🛻 load contracts
  useLoadAppContracts();
  // 🏭 connect to contracts for mainnet network & signer
  const [mainnetAdaptor] = useEthersAdaptorFromProviderOrSigners(mainnetProvider);
  useConnectAppContracts(mainnetAdaptor);
  // 🏭 connec to  contracts for current network & signer
  useConnectAppContracts(asEthersAdaptor(ethersContext));

  // -----------------------------
  // examples on how to get contracts
  // -----------------------------
  // init contracts
  const mainnetDai = useAppContracts('DAI', NETWORKS.mainnet.chainId);

  // 📟 Listen for broadcast events

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // 💵 This hook will get the price of ETH from 🦄 Uniswap:
  const [ethPrice] = useDexEthPrice(scaffoldAppProviders.mainnetAdaptor?.provider, scaffoldAppProviders.targetNetwork);

  // 💰 this hook will get your balance
  const [yourCurrentBalance] = useBalance(ethersContext.account);

  // -----------------------------
  // Hooks use and examples
  // -----------------------------
  // 🎉 Console logs & More hook examples:  Check out this to see how to get
  // useScaffoldHooksExamples(scaffoldAppProviders);

  // -----------------------------
  // .... 🎇 End of examples
  // -----------------------------

  const [route, setRoute] = useState<string>('');
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  return (
    <div className="App">
      <MainPageHeader scaffoldAppProviders={scaffoldAppProviders} price={ethPrice} />

      {/* Routes should be added between the <Switch> </Switch> as seen below */}
      <BrowserRouter>
        <MainPageMenu route={route} setRoute={setRoute} />
        <Switch>
          {/* <Route exact path="/yourcontract">
            <MainPageContracts scaffoldAppProviders={scaffoldAppProviders} />
          </Route> */}
          <Route path="/">
            <MinimalGame />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
};

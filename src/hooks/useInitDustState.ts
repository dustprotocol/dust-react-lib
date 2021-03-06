import { useEffect, useState } from 'react';
import { Provider } from '@dust-defi/evm-provider';
import { ApolloClient } from '@apollo/client';
import { useObservableState } from './useObservableState';
import { availableNetworks, Network, DustSigner } from '../state';
import { useProvider } from './useProvider';
import {
  currentNetwork$,
  setCurrentNetwork, setCurrentProvider,
} from '../appState/providerState';
import { apolloClientSubj, setApolloUrls } from '../graphql';
import { accountsSubj } from '../appState/accountState';
import { useLoadSigners } from './useLoadSigners';

const getGQLUrls = (network: Network): { ws: string; http: string }|undefined => {
  if (!network.graphqlUrl) {
    return undefined;
  }
  const ws = network.graphqlUrl.startsWith('http')
    ? network.graphqlUrl.replace('http', 'ws')
    : network.graphqlUrl;
  const http = network.graphqlUrl.startsWith('ws')
    ? network.graphqlUrl.replace('ws', 'http')
    : network.graphqlUrl;
  return { ws, http };
};
// export type UseInitDustState = [DustSigner[] | undefined, Provider | undefined, Network | undefined, boolean, any];

interface State {
  loading: boolean;
  signers?: DustSigner[];
  provider?: Provider;
  network?: Network;
  error?: any; // TODO!
}

interface StateOptions {
  network: Network;
  signers?: DustSigner[];
  client?: ApolloClient<any>;
}
export const useInitDustState = (
  applicationDisplayName: string,
  {
    network = availableNetworks.mainnet,
    client,
    signers,
  }: StateOptions,
): State => {
  const selectedNetwork: Network|undefined = useObservableState(currentNetwork$);
  const [provider, isProviderLoading] = useProvider((selectedNetwork as Network)?.rpcUrl);
  const [loadedSigners, isSignersLoading, error] = useLoadSigners(applicationDisplayName, signers ? undefined : provider);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (network && network !== selectedNetwork) {
      setCurrentNetwork(network);
    }
  }, [network]);

  useEffect(() => {
    if (selectedNetwork) {
      if (!client) {
        const gqlUrls = getGQLUrls(selectedNetwork);
        if (gqlUrls) {
          setApolloUrls(gqlUrls);
        }
      } else {
        apolloClientSubj.next(client);
      }
    }
  }, [selectedNetwork, client]);

  useEffect(() => {
    if (provider) {
      setCurrentProvider(provider);
    }
    return () => {
      provider?.api.disconnect();
    };
  }, [provider]);

  useEffect(() => {
    accountsSubj.next(signers || loadedSigners || []);
  }, [loadedSigners, signers]);

  useEffect(() => {
    setLoading(isProviderLoading || isSignersLoading);
  }, [isProviderLoading, isSignersLoading]);

  return {
    error,
    loading,
    provider,
    network: selectedNetwork,
    signers: loadedSigners,
  };
};

import { useEffect } from 'react';
import { Provider } from '@dust-defi/evm-provider';
import { DustSigner } from '../state';
import { bindEvmAddress } from '../utils/bindUtil';

export const useBindEvmAddressAlert = (
  currentSigner: DustSigner | undefined,
  provider: Provider | undefined,
): void => {
  useEffect(() => {
    if (currentSigner && provider) {
      bindEvmAddress(currentSigner, provider);
    }
  }, [currentSigner]);
};

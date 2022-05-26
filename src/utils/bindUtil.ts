import { Provider } from '@dust-defi/evm-provider';
import { utils } from 'ethers';
import { DustSigner } from '../state';
import { handleErr, TxStatusHandler, TxStatusUpdate } from './transactionUtil';

const displayedPopup: string[] = [];

export const bindEvmAddress = (
  signer: DustSigner,
  provider: Provider,
  onTxChange?: TxStatusHandler,
  generateDefault?: boolean,
): string => {
  let txIdent = '';
  if (!provider) {
    return txIdent;
  }

  const existentialDeposit = 1;
  if (utils.parseEther(signer.balance.toString()).lte(existentialDeposit)) {
    const index = displayedPopup.indexOf(signer.address);
    if (index > -1) {
      displayedPopup.splice(index, 1);
    }
  }

  if (
    signer
    && displayedPopup.indexOf(signer.address) < 0
    && !signer?.isEvmClaimed
  ) {
    // eslint-disable-next-line no-restricted-globals,no-alert
    const isDefault = generateDefault
      // eslint-disable-next-line no-restricted-globals
      || confirm('Enable Dust chain with Ethereum VM capabilities.');
    if (displayedPopup.indexOf(signer.address) < 0) {
      displayedPopup.push(signer.address);
    }
    if (isDefault) {
      txIdent = Math.random().toString(10);
      signer.signer
        .claimDefaultAccount()
        .then(() => {
          if (!onTxChange) {
            alert(`Success, Ethereum VM address is ${signer.evmAddress}. Use this address ONLY on Dust chain.`);
          } else {
            onTxChange({
              txIdent,
              isInBlock: true,
              addresses: [signer.address],
            });
          }
        })
        .catch((err) => {
          const errHandler = onTxChange
            || ((txStat: TxStatusUpdate) => alert(txStat.error?.message));
          handleErr(err, txIdent, '', errHandler, signer);
        });
    } else {
      // TODO return claimEvmAccount(currentSigner, provider);
    }
  }
  return txIdent;
};

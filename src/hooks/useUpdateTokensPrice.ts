import { Signer } from '@dust-defi/evm-provider';
import { useEffect, useRef, useState } from 'react';
import { BigNumber } from 'ethers';
import { retrieveDustCoingeckoPrice } from '../api';
import { loadPool } from '../rpc';
import {
  Pool, dustTokenWithAmount, Token, TokenWithAmount,
} from '../state';
import { ensureVoidRun } from '../utils';
import { poolRatio } from '../utils/math';

interface UpdateTokensPriceHook {
  pool?: Pool;
  signer?: Signer;
  tokens: Token[];
  factoryAddress: string;
  token1: TokenWithAmount;
  token2: TokenWithAmount;
  setToken1: (token: TokenWithAmount) => void;
  setToken2: (token: TokenWithAmount) => void;
}

const DUST_TOKEN = dustTokenWithAmount();

export const useUpdateTokensPrice = ({
  pool,
  token1,
  token2,
  tokens,
  signer,
  factoryAddress,
  setToken1,
  setToken2,
}: UpdateTokensPriceHook): boolean => {
  const mounted = useRef(true);
  const [isLoading, setIsLoading] = useState(false);
  const ensureMount = ensureVoidRun(mounted.current);

  const updateTokens = (tokenPrice1: number, tokenPrice2: number): void => {
    ensureMount(setToken1, { ...token1, price: tokenPrice1 });
    ensureMount(setToken2, { ...token2, price: tokenPrice2 });
  };

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (!pool || !signer) {
        return;
      }
      try {
        mounted.current = true;
        setIsLoading(true);
        const dustPrice = await retrieveDustCoingeckoPrice();

        // const baseRatio = poolRatio(pool);
        if (token1.address === DUST_TOKEN.address) {
          const ratio = BigNumber.from(pool.reserve1).mul(1000000).div(pool.reserve2).toNumber() / 1000000;
          updateTokens(dustPrice, dustPrice * ratio);
        } else if (token2.address === DUST_TOKEN.address) {
          const ratio = BigNumber.from(pool.reserve2).mul(1000000).div(pool.reserve1).toNumber() / 1000000;
          updateTokens(dustPrice * ratio, dustPrice);
        } else {
          const sellPool = await loadPool(
            tokens[0],
            token1,
            signer,
            factoryAddress,
          );

          const ratio = BigNumber.from(pool.reserve1).mul(1000000).div(pool.reserve2).toNumber() / 1000000;
          const sellRatio = poolRatio(sellPool);
          updateTokens(
            dustPrice * sellRatio,
            dustPrice * sellRatio * ratio,
          );
        }
      } catch (error) {
        console.error(error);
        updateTokens(1, 1);
      } finally {
        ensureMount(setIsLoading, false);
      }
    };
    load();
  }, [pool]);

  return isLoading;
};

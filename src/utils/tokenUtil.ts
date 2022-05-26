import { BigNumber, utils } from 'ethers';
import { DataProgress, DataWithProgress, isDataSet } from './dataWithProgress';
import {
  Pool, dustTokenWithAmount, Token, TokenWithAmount,
} from '../state';
import { toDecimalPlaces } from './math';

const { parseUnits, formatEther } = utils;

const getDustTokenPoolReserves = (
  dustTokenPool: Pool,
  dustAddress: string,
): { dustReserve: number; tokenReserve: number } => {
  let dustReserve: number;
  let tokenReserve: number;
  if (
    dustTokenPool.token1.address.toLowerCase() === dustAddress.toLowerCase()
  ) {
    dustReserve = parseInt(dustTokenPool.reserve1, 10);
    tokenReserve = parseInt(dustTokenPool.reserve2, 10);
  } else {
    dustReserve = parseInt(dustTokenPool.reserve2, 10);
    tokenReserve = parseInt(dustTokenPool.reserve1, 10);
  }
  return { dustReserve, tokenReserve };
};
const findDustTokenPool = (
  pools: Pool[],
  dustAddress: string,
  token: Token,
): Pool | undefined => pools.find(
  (pool) => (pool.token1.address.toLowerCase() === dustAddress.toLowerCase()
        && pool.token2.address.toLowerCase() === token.address.toLowerCase())
      || (pool.token2.address.toLowerCase() === dustAddress.toLowerCase()
        && pool.token1.address.toLowerCase() === token.address.toLowerCase()),
);

export const calculateTokenPrice = (
  token: Token,
  pools: Pool[],
  dustPrice: DataWithProgress<number>,
): DataWithProgress<number> => {
  if (!isDataSet(dustPrice)) {
    return dustPrice;
  }
  const { address: dustAddress } = dustTokenWithAmount();
  let ratio: number;
  if (token.address.toLowerCase() !== dustAddress.toLowerCase()) {
    const dustTokenPool = findDustTokenPool(pools, dustAddress, token);
    if (dustTokenPool) {
      const { dustReserve, tokenReserve } = getDustTokenPoolReserves(
        dustTokenPool,
        dustAddress,
      );
      ratio = dustReserve / tokenReserve;
      return ratio * (dustPrice as number);
    }
    return DataProgress.NO_DATA;
  }
  return dustPrice || DataProgress.NO_DATA;
};

export const calculateBalanceValue = ({
  price,
  balance,
}:
  | { price: DataWithProgress<number>; balance: BigNumber }
  | TokenWithAmount): DataWithProgress<number> => {
  if (!isDataSet(price)) {
    return price;
  }
  const priceStr = price.toString();
  const priceBN = BigNumber.from(parseUnits(toDecimalPlaces(priceStr, 18)));
  const balanceFixed = parseInt(formatEther(balance.toString()), 10);
  return parseFloat(
    formatEther(priceBN.mul(BigNumber.from(balanceFixed)).toString()),
  );
};

export const toCurrencyFormat = (value: number, options = {}): string => Intl.NumberFormat(navigator.language, {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'symbol',
  ...options,
}).format(value);

// TODO implement with svg
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getIconUrl = (address: string): string => '';

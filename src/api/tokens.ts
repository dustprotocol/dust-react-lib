import axios, { AxiosResponse } from 'axios';
import { BigNumber } from 'ethers';
import {
  Network, DustSigner, dustTokenWithAmount, Token,
} from '../state';

interface AccountTokensRes {
  tokens: AccountTokensResBalance[];
}

interface AccountTokensResBalance {
  address: string;
  balance: string;
  // eslint-disable-next-line camelcase
  contract_data: {
    decimals: number;
    symbol: string;
    name: string;
    iconUrl: string;
  };
}
function getDustTokenBalance(dustSigner: DustSigner): Promise<Token[]> {
  const dustTkn = dustTokenWithAmount();
  dustTkn.balance = dustSigner.balance;
  return Promise.resolve([dustTkn as Token]);
}

export const loadSignerTokens = async (
  dustSigner: DustSigner,
  network: Network,
): Promise<Token[]> => {
  const dustAddress = dustTokenWithAmount().address;
  try {
    return axios
      .post<void, AxiosResponse<AccountTokensRes>>(
        `${network.dustscanUrl}/api/account/tokens`,
        { address: dustSigner.address },
      )
      .then(
        (res) => {
          if (
            !res
            || !res.data
            || !res.data
            || !res.data.tokens
            || !res.data.tokens.length
          ) {
            return getDustTokenBalance(dustSigner);
          }
          return Promise.resolve(
            res.data.tokens.map(
              (resBal: AccountTokensResBalance) => ({
                address: resBal.address,
                name: resBal.contract_data.name,
                symbol: resBal.contract_data.symbol,
                decimals: resBal.contract_data.decimals,
                balance: BigNumber.from(resBal.balance),
                iconUrl:
                    !resBal.contract_data.iconUrl
                    && resBal.address === dustAddress
                      ? 'https://s2.coinmarketcap.com/static/img/coins/64x64/6951.png'
                      : resBal.contract_data.iconUrl,
                isEmpty: false,
              } as Token),
            ),
          ).then((tokens: Token[]) => {
            const dustIndex = tokens.findIndex(
              (t) => t.address === dustAddress,
            );
            let dustToken: Promise<Token>;
            if (dustIndex > 0) {
              dustToken = Promise.resolve(tokens[dustIndex]);
              tokens.splice(dustIndex, 1);
            } else {
              dustToken = getDustTokenBalance(dustSigner).then(
                (tkns) => tkns[0],
              );
            }
            return dustToken.then((rt) => [rt, ...tokens] as Token[]);
          });
        },
        (err) => {
          console.log('Error loading account tokens =', err);
          return getDustTokenBalance(dustSigner);
        },
      );
  } catch (err) {
    console.log('loadSignerTokens error = ', err);
    return getDustTokenBalance(dustSigner);
  }
};

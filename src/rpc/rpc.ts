import { Signer } from '@dust-defi/evm-provider';
import { BigNumber, Contract } from 'ethers';
import { ERC20 } from '../assets/abi/ERC20';
import { DustswapFactory } from '../assets/abi/DustswapFactory';
import { DustswapRouter } from '../assets/abi/DustswapRouter';
import { createEmptyToken, DustSigner, Token } from '../state';

export const checkIfERC20ContractExist = async (
  address: string,
  signer: Signer,
): Promise<{ name: string; symbol: string; decimals: number } | undefined> => {
  try {
    const contract = new Contract(address, ERC20, signer);
    // TODO add additional checkers to be certain of Contract existence
    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    return { name, symbol, decimals };
  } catch (error) {
    throw new Error('Unknown address');
  }
};

export const getDUST20Contract = async (
  address: string,
  signer: Signer,
): Promise<{
  contract: Contract;
  values: { name: string; symbol: string; decimals: number };
} | null> => {
  try {
    const values = await checkIfERC20ContractExist(address, signer);
    if (values) {
      return { contract: new Contract(address, ERC20, signer), values };
    }
  } catch (err) {}
  return null;
};

export const contractToToken = async (
  tokenContract: Contract,
  signer: DustSigner,
): Promise<Token> => {
  const contractToken = createEmptyToken();
  contractToken.address = tokenContract.address;
  contractToken.name = await tokenContract.name();
  contractToken.symbol = await tokenContract.symbol();
  contractToken.balance = await tokenContract.balanceOf(signer.evmAddress);
  contractToken.decimals = await tokenContract.decimals();
  return contractToken;
};

export const balanceOf = async (
  address: string,
  balanceAddress: string,
  signer: Signer,
): Promise<BigNumber | null> => {
  const contract = (await getDUST20Contract(address, signer))?.contract;
  return contract ? contract.balanceOf(balanceAddress) : null;
};

export const getDustswapRouter = (address: string, signer: Signer): Contract => new Contract(address, DustswapRouter, signer);
export const getDustswapFactory = (address: string, signer: Signer): Contract => new Contract(address, DustswapFactory, signer);

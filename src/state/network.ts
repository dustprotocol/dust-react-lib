export type AvailableNetworks = 'mainnet' | 'testnet' | 'localhost';

export interface Network {
  rpcUrl: string;
  dustscanUrl: string;
  routerAddress: string;
  factoryAddress: string;
  name: AvailableNetworks;
  graphqlUrl: string;
  genesisHash: string;
  dustscanFrontendUrl: string;
}

export const SS58_DUST = 42;

export type Networks = Record<AvailableNetworks, Network>;

export const availableNetworks: Networks = {
  testnet: {
    name: 'testnet',
    rpcUrl: 'wss://rpc-testnet.dust.llc/ws',
    dustscanUrl: 'https://testnet.dust.llc',
    factoryAddress: '0xcA36bA38f2776184242d3652b17bA4A77842707e',
    routerAddress: '0x0A2906130B1EcBffbE1Edb63D5417002956dFd41',
    graphqlUrl: 'wss://testnet.dust.llc/graphql',
    genesisHash: '0x0f89efd7bf650f2d521afef7456ed98dff138f54b5b7915cc9bce437ab728660',
    dustscanFrontendUrl: 'https://testnet.dust.llc',
  },
  mainnet: {
    name: 'mainnet',
    rpcUrl: 'wss://rpc.dust.llc/ws',
    dustscanUrl: 'https://scan.dust.llc',
    routerAddress: '0x641e34931C03751BFED14C4087bA395303bEd1A5',
    factoryAddress: '0x380a9033500154872813F6E1120a81ed6c0760a8',
    graphqlUrl: 'wss://scan.dust.llc/graphql',
    genesisHash: '0x7834781d38e4798d548e34ec947d19deea29df148a7bf32484b7b24dacf8d4b7',
    dustscanFrontendUrl: 'https://scan.dust.llc',
  },
  localhost: {
    name: 'localhost',
    rpcUrl: 'ws://localhost:9944',
    dustscanUrl: 'http://localhost:8000',
    factoryAddress: '0xD3ba2aA7dfD7d6657D5947f3870A636c7351EfE4',
    routerAddress: '0x818Be9d50d84CF31dB5cefc7e50e60Ceb73c1eb5',
    graphqlUrl: 'ws://localhost:8080/v1/graphql',
    genesisHash: '', // TODO ?
    dustscanFrontendUrl: 'http://localhost:3000',
  },
};

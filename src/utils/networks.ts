import { ChainEnvironment, NetworkInfo } from '@/types';
import { Aleph, Astar, ChainId, Development, RococoContractsTestnet } from 'useink/chains';

const LOGO_FOLDER =
  'https://raw.githubusercontent.com/Koniverse/SubWallet-ChainList/master/packages/chain-list/src/logo';

export const SUPPORTED_NETWORKS: Record<ChainEnvironment, NetworkInfo[]> = {
  // polkadot: {
  //   id: 'polkadot',
  //   name: 'Polkadot',
  //   logo: `${LOGO_FOLDER}/polkadot.png`,
  //   provider: 'wss://rpc.polkadot.io',
  //   prefix: 0,
  //   symbol: 'DOT',
  //   decimals: 10,
  //   subscanUrl: 'https://polkadot.subscan.io',
  // },
  // kusama: {
  //   id: 'kusama',
  //   name: 'Kusama',
  //   logo: `${LOGO_FOLDER}/kusama.png`,
  //   provider: 'wss://kusama-rpc.polkadot.io',
  //   prefix: 2,
  //   symbol: 'KSM',
  //   decimals: 12,
  //   subscanUrl: 'https://kusama.subscan.io',
  // },
  // rococo: {
  //   id: 'rococo',
  //   name: 'Rococo',
  //   logo: `${LOGO_FOLDER}/rococo.png`,
  //   provider: 'wss://rococo-rpc.polkadot.io',
  //   prefix: 42,
  //   symbol: 'ROC',
  //   decimals: 12,
  //   subscanUrl: 'https://rococo.subscan.io',
  // },
  // westend: {
  //   id: 'westend',
  //   name: 'Westend',
  //   logo: `${LOGO_FOLDER}/westend.png`,
  //   provider: 'wss://westend-rpc.polkadot.io',
  //   prefix: 42,
  //   symbol: 'WND',
  //   decimals: 12,
  //   subscanUrl: 'https://westend.subscan.io',
  // },
  // astar: {
  //   id: 'astar',
  //   name: 'Astar',
  //   logo: `${LOGO_FOLDER}/astar-network.png`,
  //   provider: 'wss://rpc.astar.network',
  //   prefix: 5,
  //   symbol: 'ASTR',
  //   decimals: 18,
  //   subscanUrl: 'https://astar.subscan.io',
  // },
  [ChainEnvironment.Development]: [
    {
      id: Development.id,
      name: 'Substrate Contracts Node',
      logo: '/substrate-logo.png',
      prefix: 42,
      symbol: 'UNIT',
      decimals: 12,
      chain: Development,
      motherAddress: '5CVgz1RmVpfwBacNkNoXqzzVt7uedFYimzeuxJNrRRrH7DHB',
    },
  ],
  [ChainEnvironment.Testnet]: [
    {
      id: RococoContractsTestnet.id,
      name: 'Rococo Contracts',
      logo: `/rococo-logo.png`,
      prefix: 42,
      symbol: 'ROC',
      decimals: 12,
      chain: RococoContractsTestnet,
      motherAddress: '5Ek7sr3GSpNmepi2CzmXoKrQ1qFXVZDBDNeYFZfmrTYy4JAx',
    },
  ],
  [ChainEnvironment.Production]: [
    {
      id: Astar.id,
      name: 'Astar',
      logo: `${LOGO_FOLDER}/astar-network.png`,
      prefix: 5,
      symbol: 'ASTR',
      decimals: 18,
      chain: Aleph,
      motherAddress: '---TO UPDATE---',
      disabled: true,
    },
    {
      id: Aleph.id,
      name: 'Aleph Zero',
      logo: `${LOGO_FOLDER}/aleph-zero.png`,
      prefix: 42,
      symbol: 'AZERO',
      decimals: 12,
      chain: Aleph,
      motherAddress: '---TO UPDATE---',
      disabled: true,
    },
  ],
};

export const findNetwork = (chainId: ChainId): NetworkInfo => {
  const network = Object.values(SUPPORTED_NETWORKS)
    .flat()
    .find((one) => one.id === chainId);
  if (!network) {
    throw new Error('Network not found!');
  }

  return network;
};

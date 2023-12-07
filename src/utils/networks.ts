import { ChainEnvironment, NetworkInfo } from '@/types';
import env from '@/utils/env';
import {
  Aleph,
  AlephTestnet,
  Astar,
  ChainId,
  Development,
  Phala,
  PhalaTestnet,
  RococoContractsTestnet,
  ShibuyaTestnet,
} from 'useink/chains';

const LOGO_FOLDER =
  'https://raw.githubusercontent.com/Koniverse/SubWallet-ChainList/master/packages/chain-list/src/logo';

export const SUPPORTED_NETWORKS: Record<ChainEnvironment, NetworkInfo[]> = {
  [ChainEnvironment.Development]: [
    {
      id: Development.id,
      name: 'Local Contracts',
      logo: '/substrate-logo.png',
      prefix: 42,
      symbol: 'UNIT',
      decimals: 12,
      chain: Development,
      motherAddress: env.motherAddress.dev,
    },
  ],
  [ChainEnvironment.Testnet]: [
    {
      id: AlephTestnet.id,
      name: 'Aleph Zero Testnet',
      logo: `${LOGO_FOLDER}/aleph-zero.png`,
      prefix: 42,
      symbol: 'TZERO',
      decimals: 12,
      chain: AlephTestnet,
      motherAddress: env.motherAddress.testnetAlephZero,
    },
    {
      id: PhalaTestnet.id,
      name: 'Phala Testnet',
      logo: `${LOGO_FOLDER}/phala-network.png`,
      prefix: 30,
      symbol: 'PHA',
      decimals: 12,
      chain: PhalaTestnet,
      motherAddress: env.motherAddress.testnetPhala,
    },
    {
      id: ShibuyaTestnet.id,
      name: 'Shibuya Testnet (Astar)',
      logo: `${LOGO_FOLDER}/astar-network.png`,
      prefix: 5,
      symbol: 'SBY',
      decimals: 18,
      chain: ShibuyaTestnet,
      motherAddress: env.motherAddress.testnetShibuya,
    },
    {
      id: RococoContractsTestnet.id,
      name: 'Rococo Contracts',
      logo: `/rococo-logo.png`,
      prefix: 42,
      symbol: 'ROC',
      decimals: 12,
      chain: RococoContractsTestnet,
      motherAddress: env.motherAddress.testnetRococo,
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
      chain: Astar,
      motherAddress: '',
    },
    {
      id: Aleph.id,
      name: 'Aleph Zero',
      logo: `${LOGO_FOLDER}/aleph-zero.png`,
      prefix: 42,
      symbol: 'AZERO',
      decimals: 12,
      chain: Aleph,
      motherAddress: '',
    },
    {
      id: Phala.id,
      name: 'Phala',
      logo: `${LOGO_FOLDER}/phala-network.png`,
      prefix: 30,
      symbol: 'PHA',
      decimals: 12,
      chain: Phala,
      motherAddress: '',
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

import { Development, RococoContractsTestnet } from 'useink/chains';

const isProd = import.meta.env.PROD;

const env = {
  isProd,
  isDev: !isProd,
  motherAddress: {
    dev: import.meta.env.VITE_DEV_MOTHERADDRESS,
    testnetRococo: import.meta.env.VITE_TESTNET_ROCOCO_MOTHERADDRESS,
    testnetAlephZero: import.meta.env.VITE_TESTNET_ALEPHZERO_MOTHERADDRESS,
    testnetShibuya: import.meta.env.VITE_TESTNET_SHIBUYA_MOTHERADDRESS,
    testnetPhala: import.meta.env.VITE_TESTNET_PHALA_MOTHERADDRESS,
  },
  defaultChainId: isProd ? RococoContractsTestnet.id : Development.id,
};

export default env;

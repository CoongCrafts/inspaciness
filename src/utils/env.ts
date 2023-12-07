import { Development, RococoTestnet } from 'useink/chains';

const isProd = import.meta.env.PROD;

const env = {
  isProd,
  isDev: !isProd,
  motherAddress: {
    dev: import.meta.env.VITE_DEV_MOTHERADRESS,
    testnetRococo: import.meta.env.VITE_DEV_MOTHERADRESS,
    testnetAlephZero: import.meta.env.VITE_TESTNET_ALEPHZERO_MOTHERADRESS,
    testnetShibuya: import.meta.env.VITE_TESTNET_SHIBUYA_MOTHERADRESS,
    testnetPhala: import.meta.env.VITE_TESTNET_PHALA_MOTHERADRESS,
  },
  defaultChainId: isProd ? RococoTestnet.id : Development.id,
};

export default env;

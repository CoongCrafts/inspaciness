import { AlephTestnet, Development } from 'useink/chains';

const isProd = import.meta.env.PROD;

const ipfsGateway = import.meta.env.VITE_IPFS_GATEWAY;
const pinUrl = import.meta.env.VITE_PIN_URL;
const unpinUrl = import.meta.env.VITE_UNPIN_URL;
const pinSecret = import.meta.env.VITE_PIN_SECRET;

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
  defaultChainId: isProd ? AlephTestnet.id : Development.id,
  ipfsGateway,
  pinUrl,
  unpinUrl,
  pinSecret,
};

export default env;

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import ReactDOM from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@polkadot/api-augment/polkadot';
import AppRouter from '@/AppRouter';
import WalletProvider from '@/providers/WalletProvider';
import { theme } from '@/theme';
import env from '@/utils/env';
import { SUPPORTED_NETWORKS } from '@/utils/networks';
import { UseInkProvider } from 'useink';
import { Chain, Development } from 'useink/chains';
import { ArrayOneOrMore } from 'useink/core';

const DEFAULT_CALLER = '5FWgDBZM7KNnUrDZpxr8Dij7isrXny2NNzGsovxBDFdWZYSZ';

const SUPPORTED_CHAINS = Object.values(SUPPORTED_NETWORKS)
  .flat()
  .filter((one) => one.motherAddress)
  .filter((one) => (env.isProd ? one.id !== Development.id : true))
  .map((one) => one.chain) as ArrayOneOrMore<Chain>;

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <UseInkProvider
    config={{
      dappName: 'InSpace',
      chains: SUPPORTED_CHAINS,
      caller: { default: DEFAULT_CALLER },
    }}>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <WalletProvider>
        <AppRouter />
        <ToastContainer
          position='top-right'
          closeOnClick
          pauseOnHover
          theme='colored'
          autoClose={5_000}
          hideProgressBar
        />
      </WalletProvider>
    </ChakraProvider>
  </UseInkProvider>,
);

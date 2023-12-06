import { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { useAsync, useLocalStorage } from 'react-use';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { UpdatableInjected } from '@coong/sdk/types';
import useWallets from '@/hooks/useWallets';
import { Props } from '@/types';
import Wallet from '@/wallets/Wallet';
import WebsiteWallet from '@/wallets/WebsiteWallet';

interface WalletContextProps {
  accounts: InjectedAccount[];
  injectedApi?: UpdatableInjected;
  enableWallet: (id: string) => void;
  signOut: () => void;
  availableWallets: Wallet[];
  connectedWalletId?: string;
  connectedWallet?: Wallet;
  selectedAccount?: InjectedAccount;
  setSelectedAccount: (account: InjectedAccount) => void;
  prepareTx: () => Promise<void>;
}

export const WalletContext = createContext<WalletContextProps>({
  accounts: [],
  enableWallet: () => {},
  signOut: () => {},
  availableWallets: [],
  setSelectedAccount: () => {},
  prepareTx: async () => {},
});

export const useWalletContext = () => {
  return useContext(WalletContext);
};

export default function WalletProvider({ children }: Props) {
  const availableWallets = useWallets();
  const [selectedAccount, setSelectedAccount, removeSelectedAccount] =
    useLocalStorage<InjectedAccount>('SELECTED_WALLET');
  const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
  const [injectedApi, setInjectedApi] = useState<UpdatableInjected>();
  const [connectedWalletId, setConnectedWalletId, removeConnectedWalletId] =
    useLocalStorage<string>('CONNECTED_WALLET');
  const [connectedWallet, setConnectedWallet] = useState<Wallet>();

  const getWallet = (id: string): Wallet => {
    const targetWallet: Wallet = availableWallets.find((one) => one.id === id)!;
    if (!targetWallet) {
      throw new Error('Invalid Wallet ID');
    }

    return targetWallet;
  };

  useAsync(async () => {
    if (!connectedWalletId) {
      setConnectedWallet(undefined);
      return;
    }

    let unsub: () => void;
    try {
      const targetWallet: Wallet = getWallet(connectedWalletId);
      setConnectedWallet(targetWallet);

      await targetWallet.waitUntilReady();

      const injectedProvider = targetWallet.injectedProvider;
      if (!injectedProvider?.enable) {
        throw new Error('Wallet is not existed!');
      }

      const injectedApi = await injectedProvider.enable('Sample Dapp');

      unsub = injectedApi.accounts.subscribe(setAccounts);

      setInjectedApi(injectedApi);
    } catch (e: any) {
      toast.error(e.message);
      setConnectedWallet(undefined);
      removeConnectedWalletId();
      removeSelectedAccount();
    }

    return () => unsub && unsub();
  }, [connectedWalletId]);

  const enableWallet = async (walletId: string) => {
    setConnectedWalletId(walletId);
  };

  const signOut = () => {
    if (connectedWallet) {
      const walletApi = connectedWallet.injectedProvider;

      if (walletApi?.disable) {
        walletApi.disable();
      }
    }

    removeConnectedWalletId();
    setInjectedApi(undefined);
    setSelectedAccount(undefined);
    removeSelectedAccount();
  };

  const prepareTx = async () => {
    if (connectedWallet instanceof WebsiteWallet) {
      await connectedWallet.sdk?.newWaitingWalletInstance();
    }
  };

  return (
    <WalletContext.Provider
      value={{
        accounts,
        enableWallet,
        injectedApi,
        signOut,
        availableWallets,
        connectedWalletId,
        connectedWallet,
        selectedAccount,
        setSelectedAccount,
        prepareTx,
      }}>
      {children}
    </WalletContext.Provider>
  );
}

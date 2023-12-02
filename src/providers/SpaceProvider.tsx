import { createContext, useContext } from 'react';
import { ApiPromise } from '@polkadot/api';
import useMotherContract from '@/hooks/contracts/useMotherContract';
import useSpaceContract from '@/hooks/contracts/useSpaceContract';
import useContractState from '@/hooks/useContractState';
import useSpace from '@/hooks/useSpace';
import { useWalletContext } from '@/providers/WalletProvider';
import { MemberInfo, MemberStatus, NetworkInfo, OnChainSpace, Props, SpaceConfig, SpaceInfo } from '@/types';
import { PluginInfo } from '@/types';
import { findNetwork } from '@/utils/networks';
import { findPlugin } from '@/utils/plugins';
import { ChainContract, useApi } from 'useink';

interface SpaceContextProps {
  network: NetworkInfo;
  space: OnChainSpace;
  api?: ApiPromise;
  info?: SpaceInfo;
  config?: SpaceConfig;
  membersCount?: number;
  codeHash?: string;
  motherContract?: ChainContract;
  contract?: ChainContract;
  isOwner: boolean;
  memberStatus?: MemberStatus;
  plugins?: PluginInfo[];
  memberInfo?: MemberInfo;
}

export const SpaceContext = createContext<SpaceContextProps>(null!);

export const useSpaceContext = () => {
  const context = useContext(SpaceContext);
  if (!context) {
    throw new Error('SpaceContextProvider is missing!');
  }

  return context;
};

interface SpaceProviderProps extends Props {
  space: OnChainSpace;
}

export default function SpaceProvider({ space, children }: SpaceProviderProps) {
  const motherContract = useMotherContract(space.chainId);
  const contract = useSpaceContract(space);
  const { selectedAccount } = useWalletContext();

  const { state: installedPlugins } = useContractState<[string, string][]>(contract, 'plugins');
  const { info, membersCount, config, codeHash, ownerId, memberStatus, memberInfo } = useSpace(space);
  const network = findNetwork(space.chainId);
  const { api } = useApi(space.chainId) || {};

  const isOwner = selectedAccount?.address === ownerId;
  const plugins = installedPlugins?.map(([pluginId, address]) => ({
    ...findPlugin(pluginId)!, // TODO filter-out unsupported plugins
    address,
    chainId: space.chainId,
  }));

  return (
    <SpaceContext.Provider
      value={{
        network,
        space,
        api,
        info,
        membersCount,
        config,
        codeHash,
        motherContract,
        contract,
        isOwner,
        memberStatus,
        plugins,
        memberInfo,
      }}>
      {children}
    </SpaceContext.Provider>
  )
}


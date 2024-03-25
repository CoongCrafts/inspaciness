import { createContext, useContext } from 'react';
import { ApiPromise } from '@polkadot/api';
import useSpaceContract from '@/hooks/contracts/useSpaceContract';
import useContractState from '@/hooks/useContractState';
import useSpace from '@/hooks/useSpace';
import { useWalletContext } from '@/providers/WalletProvider';
import {
  MemberInfo,
  MembershipRequest,
  MemberStatus,
  NetworkInfo,
  OnChainPluginInfo,
  OnChainSpace,
  PluginInfo,
  Props,
  SpaceConfig,
  SpaceInfo,
} from '@/types';
import { findNetwork } from '@/utils/networks';
import { findPlugin, findPluginVersion } from '@/utils/plugins';
import { equalAddresses } from '@/utils/string';
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
  ownerAddress?: string;
  memberStatus?: MemberStatus;
  plugins?: PluginInfo[];
  memberInfo?: MemberInfo;
  pendingRequest?: MembershipRequest;
  pendingRequestsCount?: number;
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
  motherContract?: ChainContract;
}

export default function SpaceProvider({ space, motherContract, children }: SpaceProviderProps) {
  const { contract } = useSpaceContract(space);
  const { selectedAccount } = useWalletContext();

  const { state: installedPlugins } = useContractState<OnChainPluginInfo[]>(contract, 'plugins');
  const {
    info,
    membersCount,
    pendingRequest,
    config,
    codeHash,
    ownerId,
    memberStatus,
    memberInfo,
    pendingRequestsCount,
  } = useSpace(space);
  const network = findNetwork(space.chainId);
  const { api } = useApi(space.chainId) || {};

  const isOwner = equalAddresses(selectedAccount?.address, ownerId);
  const plugins: PluginInfo[] | undefined = installedPlugins
    ?.map((plugin) => ({
      ...plugin,
      ...findPlugin(plugin.id)!, // TODO filter-out unsupported plugins
      chainId: space.chainId,
    }))
    .map((plugin) => ({ ...plugin, version: findPluginVersion(plugin) }));

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
        pendingRequest,
        pendingRequestsCount,
        ownerAddress: ownerId,
      }}>
      {children}
    </SpaceContext.Provider>
  );
}

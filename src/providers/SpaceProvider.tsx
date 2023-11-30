import useSpace from "@/hooks/useSpace";
import { createContext, useContext } from "react";
import { MemberStatus, NetworkInfo, OnChainSpace, Props, SpaceConfig, SpaceInfo } from "@/types";
import { findNetwork } from "@/utils/networks";
import { ApiPromise } from "@polkadot/api";
import { ChainContract, useApi } from "useink";
import useMotherContract from "@/hooks/contracts/useMotherContract";
import useSpaceContract from "@/hooks/contracts/useSpaceContract";
import { useWalletContext } from "@/providers/WalletProvider";

interface SpaceContextProps {
  network: NetworkInfo;
  space: OnChainSpace;
  api?: ApiPromise;
  info?: SpaceInfo;
  config?: SpaceConfig;
  membersCount?: number;
  codeHash?: string;
  motherContract?: ChainContract
  contract?: ChainContract,
  isOwner: boolean;
  memberStatus?: MemberStatus;
}

export const SpaceContext = createContext<SpaceContextProps>(null!);

export const useSpaceContext = () => {
  const context = useContext(SpaceContext);
  if (!context) {
    throw new Error('SpaceContextProvider is missing!')
  }

  return context;
}

interface SpaceProviderProps extends Props {
  space: OnChainSpace;
}

export default function SpaceProvider({space, children}: SpaceProviderProps) {
  const motherContract = useMotherContract(space.chainId);
  const contract = useSpaceContract(space);
  const { selectedAccount } = useWalletContext();

  const {info, membersCount, config, codeHash, ownerId, memberStatus} = useSpace(space);
  const network = findNetwork(space.chainId);
  const {api} = useApi(space.chainId) || {};

  const isOwner = selectedAccount?.address === ownerId;

  return (
    <SpaceContext.Provider value={{network, space, api, info, membersCount, config, codeHash, motherContract, contract, isOwner, memberStatus}}>
      {children}
    </SpaceContext.Provider>
  )
}

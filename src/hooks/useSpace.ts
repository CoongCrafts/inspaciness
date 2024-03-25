import useSpaceContract from '@/hooks/contracts/useSpaceContract';
import useContractState from '@/hooks/useContractState';
import { useWalletContext } from '@/providers/WalletProvider';
import { MemberInfo, MembershipRequest, MemberStatus, OnChainSpace, SpaceConfig, SpaceInfo } from '@/types';
import { stringToNum } from '@/utils/number';

export default function useSpace(space: OnChainSpace) {
  const { contract } = useSpaceContract(space);
  const { selectedAccount } = useWalletContext();

  const { state: info } = useContractState<SpaceInfo>(contract, 'spaceProfile::info');
  const { state: membersCountStr } = useContractState<string>(contract, 'membersCount');
  const { state: memberStatus } = useContractState<MemberStatus>(contract, 'memberStatus', [selectedAccount?.address]);
  const { state: config } = useContractState<SpaceConfig>(contract, 'spaceProfile::config');
  const { state: codeHash } = useContractState<string>(contract, 'codeHash::codeHash');
  const { state: ownerId } = useContractState<string>(contract, 'ownable::owner');
  const { state: memberInfo } = useContractState<MemberInfo>(contract, 'memberInfo', [selectedAccount?.address]);
  const { state: pendingRequest } = useContractState<MembershipRequest>(contract, 'pendingRequestFor', [
    selectedAccount?.address,
  ]);
  const { state: pendingRequestsCountStr } = useContractState<string>(contract, 'pendingRequestsCount');

  return {
    info,
    config,
    membersCount: stringToNum(membersCountStr),
    codeHash,
    ownerId,
    memberStatus,
    memberInfo,
    pendingRequest,
    pendingRequestsCount: stringToNum(pendingRequestsCountStr),
  };
}

import { Button, Icon, Tag } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { MdPendingActions } from 'react-icons/md';
import { Link as LinkRouter, useLocation } from 'react-router-dom';
import usePostsContract from '@/hooks/contracts/plugins/usePostsContract';
import useContractState from '@/hooks/useContractState';
import { SpacePath } from '@/pages/Space';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { useWalletContext } from '@/providers/WalletProvider';
import { PluginInfo, PostPerm, Props } from '@/types';
import { stringToNum } from '@/utils/number';

interface PendingPostsButtonProps extends Props {
  info: PluginInfo;
}

export default function PendingPostsButton({ info }: PendingPostsButtonProps) {
  const location = useLocation();
  const { isOwner } = useSpaceContext();
  const { selectedAccount } = useWalletContext();
  const { contract } = usePostsContract(info);
  const [pendingPostsCount, setPendingPostsCount] = useState<number>(0);
  const { state: postPerm } = useContractState<PostPerm>(contract, 'postPerm');
  const { state: pendingPostsCountResults } = useContractState<string>(contract, 'pendingPostsCount');
  const { state: pendingPostsCountByAuthorResult } = useContractState<string>(contract, 'pendingPostsCountByAuthor', [
    selectedAccount?.address,
  ]);

  useEffect(() => {
    if (isOwner) {
      if (!pendingPostsCountResults) return;
      setPendingPostsCount(stringToNum(pendingPostsCountResults)!);
    } else {
      if (!pendingPostsCountByAuthorResult) return;
      setPendingPostsCount(stringToNum(pendingPostsCountByAuthorResult)!);
    }
  }, [pendingPostsCountResults, pendingPostsCountByAuthorResult]);

  if (postPerm !== PostPerm.ActiveMemberWithApproval || !pendingPostsCount) {
    return null;
  }

  const onActive = location.pathname.split('/').at(-1) === SpacePath.PendingPosts;

  return (
    <Button
      leftIcon={<Icon boxSize='5' as={MdPendingActions} />}
      justifyContent={'start'}
      fontSize='sm'
      width='100%'
      gap={2}
      as={LinkRouter}
      variant='link'
      p={2}
      borderRightWidth={onActive ? 2 : 1}
      borderRightColor={onActive ? 'primary.500' : 'dark'}
      color={onActive ? 'primary.500' : 'dark'}
      background={onActive ? 'primary.50' : 'dark'}
      _hover={{ textDecoration: 'none' }}
      borderRadius={0}
      to={SpacePath.PendingPosts}>
      Pending Posts
      <Tag size='sm' colorScheme='red' variant='solid'>
        {pendingPostsCount}
      </Tag>
    </Button>
  );
}

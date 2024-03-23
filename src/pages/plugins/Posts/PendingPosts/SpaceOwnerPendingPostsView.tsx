import { Box, Button, Flex, IconButton, Tag, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import usePagination from '@/hooks/usePagination';
import { useTx } from '@/hooks/useink/useTx';
import PendingPostCardWithApprovalSelect from '@/pages/plugins/Posts/PendingPosts/PendingPostCardWithApprovalSelect';
import { usePostsContext } from '@/pages/plugins/Posts/PostsProvider';
import { PendingPostApproval, PostRecord } from '@/types';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { AddIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { shouldDisableStrict } from 'useink/utils';

export default function SpaceOwnerPendingPostsView() {
  const { contract } = usePostsContext();
  const freeBalance = useCurrentFreeBalance();
  const [pendingPostsApproval, setPendingPostsApproval] = useState<PendingPostApproval[]>([]);
  const submitPendingPostsApproval = useTx(contract, 'submitPendingPostApprovals');

  const {
    items,
    pageIndex,
    setPageIndex,
    numberOfPage,
    total: pendingPostsCount,
  } = usePagination<PostRecord>(contract, 'listPendingPosts', 5);

  const handleSelect = (pendingPostApproval: PendingPostApproval) => {
    setPendingPostsApproval((prevState) => {
      const index = prevState.findIndex(([postId]) => postId === pendingPostApproval[0]);
      if (index >= 0) {
        if (pendingPostApproval[1] === prevState[index][1]) {
          return prevState.toSpliced(index, 1);
        }
        return prevState.toSpliced(index, 1, pendingPostApproval);
      }
      return [...prevState, pendingPostApproval];
    });
  };

  const submitApprovals = (pendingPostApprovals: PendingPostApproval[]) => {
    if (pendingPostApprovals.length === 0) {
      return;
    }

    if (freeBalance === 0) {
      toast.error(messages.insufficientBalance);
      return;
    }

    submitPendingPostsApproval.signAndSend([pendingPostApprovals], {}, (result) => {
      if (!result) {
        submitPendingPostsApproval.resetState();
        return;
      }

      notifyTxStatus(result);

      if (result?.isInBlock) {
        if (result.dispatchError) {
          toast.error(messages.txError);
        } else {
          toast.success('Pending posts approval submitted');
        }

        submitPendingPostsApproval.resetState();
        setPendingPostsApproval([]);
      }
    });
  };

  const hasPendingPost = !!items?.length;

  return (
    <Flex flexDir='column' gap={4}>
      <Flex justifyContent='space-between'>
        <Flex gap={2} align='center'>
          <Text fontSize='xl' fontWeight='semibold'>
            Pending Posts
          </Text>
          <Box>
            <Tag>{pendingPostsCount}</Tag>
          </Box>
        </Flex>
        {hasPendingPost && (
          <Box>
            <Button
              variant='outline'
              colorScheme='primary'
              size='sm'
              onClick={() => submitApprovals(pendingPostsApproval)}
              isLoading={shouldDisableStrict(submitPendingPostsApproval)}
              isDisabled={pendingPostsApproval.length === 0}
              display={{ base: 'none', md: 'flex' }}>
              Submit Approvals
            </Button>
            <IconButton
              colorScheme='primary'
              size='sm'
              variant='outline'
              onClick={() => submitApprovals(pendingPostsApproval)}
              aria-label={'Submit'}
              icon={<AddIcon />}
              isLoading={shouldDisableStrict(submitPendingPostsApproval)}
              isDisabled={pendingPostsApproval.length === 0}
              display={{ base: 'flex', md: 'none' }}
            />
          </Box>
        )}
      </Flex>
      <Flex flexDir='column'>
        {!hasPendingPost && <Text>There are no pending posts.</Text>}
        {items?.map((postRecord) => (
          <PendingPostCardWithApprovalSelect
            key={postRecord.postId}
            postRecord={postRecord}
            approval={pendingPostsApproval.find((approval) => approval[0] === postRecord.postId)}
            handleSelect={handleSelect}
          />
        ))}
      </Flex>
      {hasPendingPost && (
        <Flex mt={4} justifyContent={'space-between'} alignItems='center' gap={2}>
          <Text fontSize='sm' fontWeight='semibold' color='dimgray'>{`Page ${pageIndex}/${numberOfPage}`}</Text>
          <Flex alignItems='center' gap={2}>
            <IconButton
              onClick={() => setPageIndex((pre) => pre - 1)}
              aria-label='Back'
              size='sm'
              icon={<ChevronLeftIcon fontSize='1.2rem' />}
              isDisabled={pageIndex === 1}
            />
            <IconButton
              onClick={() => setPageIndex((pre) => pre + 1)}
              aria-label='Next'
              size='sm'
              icon={<ChevronRightIcon fontSize='1.2rem' />}
              isDisabled={pageIndex === numberOfPage}
            />
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}

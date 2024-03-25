import { Box, Flex, Tag, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import useContractState from '@/hooks/useContractState';
import { useWalletContext } from '@/providers/WalletProvider';
import { PostRecord } from '@/types';
import { usePostsContext } from '../PostsProvider';
import PendingPostCard from './PendingPostCard';

interface PendingPostsByAuthorResult {
  Ok?: PostRecord[];
  Err?: {
    NotActiveMember: string;
    UnAuthorized: string;
  };
}

export default function MembersPendingPostsView() {
  const { selectedAccount } = useWalletContext();
  const { contract } = usePostsContext();
  const [pendingPosts, setPendingPosts] = useState<PostRecord[]>();
  const { state: pendingPostsByAuthorResult } = useContractState<PendingPostsByAuthorResult>(
    contract,
    'pendingPostsByAuthor',
    [selectedAccount?.address],
  );

  useEffect(() => {
    if (!pendingPostsByAuthorResult?.Ok) return;

    setPendingPosts(pendingPostsByAuthorResult.Ok);
  }, [pendingPostsByAuthorResult]);

  const pendingPostsCount = pendingPosts?.length || 0;

  return (
    <Flex flexDir='column' gap={4}>
      <Flex>
        <Flex align='center' gap={2}>
          <Text fontSize='xl' fontWeight='semibold'>
            Your Pending Posts
          </Text>
          <Box>
            <Tag>{pendingPostsCount}</Tag>
          </Box>
        </Flex>
      </Flex>
      {pendingPostsCount === 0 && (
        <Box>
          <Text>You have no pending posts.</Text>
        </Box>
      )}
      {pendingPosts?.map((postRecord) => (
        <PendingPostCard key={postRecord.postId} postRecord={postRecord} />
      ))}
    </Flex>
  );
}

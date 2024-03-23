import { Box, Text } from '@chakra-ui/react';
import MembersPendingPostsView from '@/pages/plugins/Posts/PendingPosts/MembersPendingPostsView';
import SpaceOwnerPendingPostsView from '@/pages/plugins/Posts/PendingPosts/SpaceOwnerPendingPostsView';
import { usePostsContext } from '@/pages/plugins/Posts/PostsProvider';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { MemberStatus, PostPerm } from '@/types';

export default function PendingPostsView() {
  const { isOwner, memberStatus } = useSpaceContext();
  const { postPerm } = usePostsContext();

  if (postPerm !== PostPerm.ActiveMemberWithApproval) {
    return (
      <Box>
        <Text>This feature is disabled</Text>
      </Box>
    );
  }

  if (isOwner) {
    return <SpaceOwnerPendingPostsView />;
  } else if (memberStatus === MemberStatus.Active) {
    return <MembersPendingPostsView />;
  }
}

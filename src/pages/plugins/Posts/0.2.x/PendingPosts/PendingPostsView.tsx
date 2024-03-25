import { Box, Text } from '@chakra-ui/react';
import { useSpaceContext } from '@/pages/space/0.1.x/SpaceProvider';
import { MemberStatus, PostPerm } from '@/types';
import { usePostsContext } from '../PostsProvider';
import MembersPendingPostsView from './MembersPendingPostsView';
import SpaceOwnerPendingPostsView from './SpaceOwnerPendingPostsView';

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

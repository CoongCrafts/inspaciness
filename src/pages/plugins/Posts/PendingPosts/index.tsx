import { Box, Text } from '@chakra-ui/react';
import PendingPostsView from '@/pages/plugins/Posts/PendingPosts/PendingPostsView';
import PostsProvider from '@/pages/plugins/Posts/PostsProvider';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { PLUGIN_POSTS } from '@/utils/plugins';

export default function PendingPosts() {
  const { plugins } = useSpaceContext();
  const postPlugin = plugins?.find((p) => p.id === PLUGIN_POSTS);
  if (!postPlugin) {
    return null;
  }

  if (postPlugin.disabled) {
    return (
      <Box>
        <Text>This feature is disabled</Text>
      </Box>
    );
  }

  return (
    <PostsProvider info={postPlugin}>
      <PendingPostsView />
    </PostsProvider>
  );
}

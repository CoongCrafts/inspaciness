import { Box, Text } from '@chakra-ui/react';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { PLUGIN_POSTS } from '@/utils/plugins';
import PostsProvider from '../PostsProvider';
import PendingPostsView from './PendingPostsView';

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

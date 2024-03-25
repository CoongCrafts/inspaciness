import { Box, Text } from '@chakra-ui/react';
import React, { Suspense } from 'react';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { PLUGIN_POSTS } from '@/utils/plugins';

const Posts_V0_1_X = React.lazy(() => import(`./0.1.x/index`));
const Posts_V0_2_X = React.lazy(() => import(`./0.2.x/index`));

export default function Posts() {
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

  const { version = '0.1.0' } = postPlugin;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {version.startsWith('0.1.') && <Posts_V0_1_X plugin={postPlugin} />}
      {version.startsWith('0.2.') && <Posts_V0_2_X plugin={postPlugin} />}
    </Suspense>
  );
}

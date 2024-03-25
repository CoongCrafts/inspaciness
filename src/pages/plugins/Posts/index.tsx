import { Box, Text } from '@chakra-ui/react';
import React, { Suspense } from 'react';
import { useSpacePlugin } from '@/pages/space/0.1.x/SpaceProvider';
import { PLUGIN_POSTS } from '@/utils/plugins';
import { compare } from 'compare-versions';

const Posts_V0_1_X = React.lazy(() => import(`./0.1.x/index`));
const Posts_V0_2_X = React.lazy(() => import(`./0.2.x/index`));

export default function Posts() {
  const plugin = useSpacePlugin(PLUGIN_POSTS);

  if (!plugin) {
    return null;
  }

  if (plugin.disabled) {
    return (
      <Box>
        <Text>This feature is disabled</Text>
      </Box>
    );
  }

  const { version = '0.1.0' } = plugin;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {compare(version, '0.2.0', '<') && <Posts_V0_1_X plugin={plugin} />}
      {compare(version, '0.2.0', '>=') && <Posts_V0_2_X plugin={plugin} />}
    </Suspense>
  );
}

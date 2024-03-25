import { Box, Text } from '@chakra-ui/react';
import React, { Suspense } from 'react';
import { useSpacePlugin } from '@/pages/space/0.1.x/SpaceProvider';
import { PLUGIN_POLLS } from '@/utils/plugins';

const Polls_V0_1_X = React.lazy(() => import(`./0.1.x/index`));

export default function Polls() {
  const plugin = useSpacePlugin(PLUGIN_POLLS);
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

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Polls_V0_1_X plugin={plugin} />
    </Suspense>
  );
}

import { Box, Text } from '@chakra-ui/react';
import PollsProvider from '@/pages/plugins/Polls/PollsProvider';
import PollsView from '@/pages/plugins/Polls/PollsView';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { PLUGIN_POLLS } from '@/utils/plugins';

export default function Polls() {
  const { plugins } = useSpaceContext();
  const pollsPlugin = plugins?.find((one) => (one.id = PLUGIN_POLLS));
  if (!pollsPlugin) {
    return null;
  }

  if (pollsPlugin.disabled) {
    return (
      <Box>
        <Text>This feature is disabled</Text>
      </Box>
    );
  }

  return (
    <PollsProvider info={pollsPlugin}>
      <PollsView />
    </PollsProvider>
  );
}

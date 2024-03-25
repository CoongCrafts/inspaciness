import PollsProvider from '@/pages/plugins/Polls/0.1.x/PollsProvider';
import PollsView from '@/pages/plugins/Polls/0.1.x/PollsView';
import { PluginProps } from '@/types';

export default function Polls_V0_1_X({ plugin }: PluginProps) {
  return (
    <PollsProvider info={plugin}>
      <PollsView />
    </PollsProvider>
  );
}

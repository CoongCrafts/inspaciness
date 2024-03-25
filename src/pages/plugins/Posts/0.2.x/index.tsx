import { PluginProps } from '@/types';
import PostsProvider from './PostsProvider';
import PostsView from './PostsView';

export default function Posts_V0_2_X({ plugin }: PluginProps) {
  return (
    <PostsProvider info={plugin}>
      <PostsView />
    </PostsProvider>
  );
}

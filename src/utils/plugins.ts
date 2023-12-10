import flipperMetadata from '@/metadata/flipper.json';
import pollsMetadata from '@/metadata/polls.json';
import postsMetadata from '@/metadata/posts.json';
import { Plugin } from '@/types';

export const PLUGIN_POSTS = 'POST';
export const PLUGIN_FLIPPER = 'FLIP';
export const PLUGIN_POLLS = 'POLL';

const REGISTERED_PLUGINS: Plugin[] = [
  {
    id: PLUGIN_POSTS,
    name: 'Posts',
    description: 'Keep space members updated with posts and announcements.',
  },
  {
    id: PLUGIN_FLIPPER,
    name: 'Flipper',
    description: 'Flip a boolean value, only active member can flip.',
  },
  {
    id: PLUGIN_POLLS,
    name: 'Polls',
    description: 'Create and vote on polls within your space, where only active members have a voice.',
  },
];

export const findPlugin = (id: string): Plugin | undefined => {
  return REGISTERED_PLUGINS.find((p) => p.id === id);
};

export const findPluginMetadata = (id: string) => {
  if (id === PLUGIN_POSTS) {
    return postsMetadata;
  } else if (id === PLUGIN_FLIPPER) {
    return flipperMetadata;
  } else if (id === PLUGIN_POLLS) {
    return pollsMetadata;
  }
};

export default REGISTERED_PLUGINS;

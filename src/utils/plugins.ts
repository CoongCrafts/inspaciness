import { FlipperMetadatas, PollsMetadatas, PostsMetadatas } from '@/metadata';
import { Plugin, PluginInfo } from '@/types';

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

export const findPluginMetadata = (plugin: PluginInfo) => {
  const { id, codeHash } = plugin;

  if (id === PLUGIN_POSTS) {
    return PostsMetadatas.find((m) => m.hash === codeHash);
  } else if (id === PLUGIN_FLIPPER) {
    return FlipperMetadatas.find((m) => m.hash === codeHash);
  } else if (id === PLUGIN_POLLS) {
    return PollsMetadatas.find((m) => m.hash === codeHash);
  }
};

export default REGISTERED_PLUGINS;

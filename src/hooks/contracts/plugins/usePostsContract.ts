import { PostsMetadatas } from '@/metadata';
import { PluginInfo } from '@/types';
import { useContract } from 'useink';

export default function usePostsContract(plugin: PluginInfo) {
  const metadata = PostsMetadatas.find((m) => m.hash === plugin.codeHash);

  return {
    contract: metadata && useContract(plugin.address, metadata.metadata, plugin.chainId),
    metadata,
  };
}

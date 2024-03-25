import { PollsMetadatas } from '@/metadata';
import { PluginInfo } from '@/types';
import { useContract } from 'useink';

export default function usePollsContract(plugin: PluginInfo) {
  const metadata = PollsMetadatas.find((m) => m.hash === plugin.codeHash);

  return {
    contract: metadata && useContract(plugin.address, metadata.metadata, plugin.chainId),
    metadata,
  };
}

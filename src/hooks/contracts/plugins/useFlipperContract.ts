import { FlipperMetadatas } from '@/metadata';
import { PluginInfo } from '@/types';
import { useContract } from 'useink';

export default function useFlipperContract(plugin: PluginInfo) {
  const metadata = FlipperMetadatas.find((m) => m.hash === plugin.codeHash || m.version === plugin.version);

  return {
    contract: metadata && useContract(plugin.address, metadata.metadata, plugin.chainId),
    metadata,
  };
}

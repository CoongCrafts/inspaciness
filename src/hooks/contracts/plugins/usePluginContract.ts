import { PluginInfo } from '@/types';
import { findPluginMetadata } from '@/utils/plugins';
import { useContract } from 'useink';

export default function usePluginContract(plugin: PluginInfo) {
  const metadata = findPluginMetadata(plugin);
  return {
    contract: metadata && useContract(plugin.address, metadata.metadata, plugin.chainId),
    metadata,
  };
}

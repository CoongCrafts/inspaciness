import { PluginInfo } from '@/types';
import { findPluginMetadata } from '@/utils/plugins';
import { useContract } from 'useink';

export default function usePluginContract(plugin: PluginInfo) {
  return useContract(plugin.address, findPluginMetadata(plugin.id)!, plugin.chainId);
}

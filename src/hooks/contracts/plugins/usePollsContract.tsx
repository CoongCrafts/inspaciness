import polls from '@/metadata/polls.json';
import { PluginInfo } from '@/types';
import { useContract } from 'useink';

export default function usePollsContract(info: PluginInfo) {
  return useContract(info.address, polls, info.chainId);
}

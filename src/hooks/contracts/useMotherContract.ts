import { MotherspaceMetadataLatest } from '@/metadata';
import { findNetwork } from '@/utils/networks';
import { useContract } from 'useink';
import { ChainId } from 'useink/chains';

export default function useMotherContract(chainId: ChainId) {
  const { motherAddress } = findNetwork(chainId);

  if (!motherAddress) {
    throw new Error('Missing MotherAddress!');
  }

  return useContract(motherAddress, MotherspaceMetadataLatest.metadata, chainId);
}

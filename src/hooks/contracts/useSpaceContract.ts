import { SpaceMetadatas } from '@/metadata';
import { OnChainSpace } from '@/types';
import { useContract } from 'useink';

export default function useSpaceContract(space: OnChainSpace) {
  const metadata = SpaceMetadatas.find((m) => m.hash === space.codeHash || m.version === space.version);

  return {
    contract: metadata && useContract(space.address, metadata.metadata, space.chainId),
    metadata,
  };
}

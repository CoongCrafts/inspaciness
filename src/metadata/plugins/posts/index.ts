import { ContractMetadata } from '@/types';
import v0_1_0 from './0.1.0.json';
import v0_2_0 from './0.2.0.json';

export const PostsMetadatas: ContractMetadata[] = [
  {
    version: v0_1_0.contract.version,
    hash: v0_1_0.source.hash,
    metadata: v0_1_0,
  },
  {
    version: v0_2_0.contract.version,
    hash: v0_2_0.source.hash,
    metadata: v0_2_0,
  },
];

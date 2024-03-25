import { ContractMetadata } from '@/types';
import v0_1_0 from './0.1.0.json';

export const MotherspaceMetadatas: ContractMetadata[] = [
  {
    version: v0_1_0.contract.version,
    hash: v0_1_0.source.hash,
    metadata: v0_1_0,
  },
];

export const MotherspaceMetadataLatest = MotherspaceMetadatas.slice(-1)[0];

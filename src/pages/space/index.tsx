import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import SpaceSkeleton from '@/components/sketeton/SpaceSkeleton';
import useMotherContract from '@/hooks/contracts/useMotherContract';
import useContractState from '@/hooks/useContractState';
import { CodeHash } from '@/types';
import { ChainId } from 'useink/chains';

const Space_V0_1_X = React.lazy(() => import('./0.1.x/index'));

export default function Space() {
  const { chainId, spaceAddress } = useParams();
  const motherContract = useMotherContract(chainId as ChainId);
  const { state: codeHash } = useContractState<{ Ok: CodeHash; Err: string }>(motherContract, 'spaceCodeHash', [
    spaceAddress!,
  ]);

  if (!codeHash) {
    return <SpaceSkeleton />;
  }

  if (codeHash.Err) {
    // TODO handle error
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Space_V0_1_X
        space={{ address: spaceAddress!, chainId: chainId as ChainId, codeHash: codeHash.Ok }}
        motherContract={motherContract}
      />
    </Suspense>
  );
}

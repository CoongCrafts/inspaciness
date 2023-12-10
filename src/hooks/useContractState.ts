import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { ContractPromise } from '@polkadot/api-contract';
import { useCall } from '@/hooks/useink/useCall';
import { ChainContract, useBlockHeader } from 'useink';
import { pickDecoded } from 'useink/utils';

export default function useContractState<T>(
  contract: ChainContract<ContractPromise> | undefined,
  message: string,
  args: unknown[] = [],
  defaultCaller = true,
) {
  const [state, setState] = useState<T>();
  const call = useCall<T>(contract, message);
  const blockNumber = useBlockHeader(contract?.chainId)?.blockNumber;
  const actualArgs = useMemo(() => args, args);

  useAsync(async () => {
    const result = await call.send(actualArgs, { defaultCaller });
    setState(pickDecoded<T>(result));
  }, [call.send, blockNumber, actualArgs]);

  return { state };
}

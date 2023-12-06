import { useEffect, useState } from 'react';
import { useAsync } from 'react-use';
import useMotherContract from '@/hooks/contracts/useMotherContract';
import { useCall } from '@/hooks/useink/useCall';
import { useWalletContext } from '@/providers/WalletProvider';
import { OnChainSpace } from '@/types';
import { ChainId } from 'useink/chains';
import { pickDecoded } from 'useink/utils';

export default function useSpaces(chainId: ChainId): OnChainSpace[] {
  const { selectedAccount } = useWalletContext();
  const [spaces, setSpaces] = useState<string[]>();
  const motherContract = useMotherContract(chainId);
  const memberSpacesCall = useCall<string[]>(motherContract, 'memberSpaces');
  const memberAddress = selectedAccount?.address;

  useEffect(() => {
    setSpaces([]);
  }, [chainId]);

  useAsync(async () => {
    if (memberAddress && motherContract) {
      const result = await memberSpacesCall.send([memberAddress]);
      setSpaces(pickDecoded(result));
    } else {
      setSpaces(undefined);
    }
  }, [memberAddress, memberSpacesCall.send]);

  return spaces ? spaces.map((one) => ({ address: one, chainId })) : [];
}

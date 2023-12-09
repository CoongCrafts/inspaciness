import { createContext, useContext, useMemo } from 'react';
import usePollsContract from '@/hooks/contracts/plugins/usePollsContract';
import useContractState from '@/hooks/useContractState';
import { PluginInfo, Poll, Props } from '@/types';
import { stringToNum } from '@/utils/number';
import { ChainContract } from 'useink';

interface PollsContext {
  info: PluginInfo;
  contract?: ChainContract;
  pollsCount?: number;
  polls: Poll[];
}

export const PollsContext = createContext<PollsContext>(null!);

export const usePollsContext = () => {
  const context = useContext(PollsContext);
  if (!context) {
    throw new Error('PollsProvider is missing!');
  }

  return context;
};

interface PollsProviderProps extends Props {
  info: PluginInfo;
}

export default function PollsProvider({ info, children }: PollsProviderProps) {
  const contract = usePollsContract(info);
  const { state: pollsCountStr = '0' } = useContractState<string>(contract, 'pollsCount');
  const pollsCount = parseInt(pollsCountStr);

  const pollsId = useMemo(() => [...Array(pollsCount)].map((_, idx) => idx).reverse(), [pollsCount]);
  const { state: rawPolls = [] } = useContractState<[string, any | null][]>(contract, 'pollsByIds', [pollsId]);
  const polls = rawPolls
    .filter((one) => !!one)
    .map(
      ([idStr, rawPoll]) =>
        ({
          id: parseInt(idStr),
          createdAt: rawPoll.createdAt && stringToNum(rawPoll.createdAt),
          updatedAt: rawPoll.updatedAt && stringToNum(rawPoll.updatedAt),
          expiredAt: rawPoll.expiredAt && stringToNum(rawPoll.expiredAt),
          ...rawPoll,
        } as Poll),
    );

  return <PollsContext.Provider value={{ info, contract, pollsCount, polls }}>{children}</PollsContext.Provider>;
}

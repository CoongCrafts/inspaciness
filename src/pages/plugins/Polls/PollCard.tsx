import { Box, Flex, IconButton, Menu, MenuButton, MenuList, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { RiMore2Fill } from 'react-icons/ri';
import useContractState from '@/hooks/useContractState';
import { usePollsContext } from '@/pages/plugins/Polls/PollsProvider';
import EditPollButton from '@/pages/plugins/Polls/actions/EditPollButton';
import UnvoteButton from '@/pages/plugins/Polls/actions/UnvoteButton';
import VoteButton from '@/pages/plugins/Polls/actions/VoteButton';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { MemberStatus, Poll, PollVotes, Props } from '@/types';
import { fromNow, now, timestampToDate } from '@/utils/date';
import { stringToNum } from '@/utils/number';

interface PollVotesResult {
  Ok?: PollVotes;
  Err?: {
    PollNotFound: string;
  };
}

interface PollCardProps extends Props {
  poll: Poll;
}

export default function PollCard({ poll }: PollCardProps) {
  const { isOwner, memberStatus } = useSpaceContext();
  const { contract } = usePollsContext();
  const { state: pollVotesResults } = useContractState<PollVotesResult>(contract, 'pollVotes', [poll.id]);
  const [voteOption, setVoteOption] = useState<number>();

  useEffect(() => {
    if (!pollVotesResults?.Ok) {
      return;
    }

    setVoteOption(stringToNum(pollVotesResults.Ok?.votedOption || undefined));
  }, [pollVotesResults]);

  if (!pollVotesResults?.Ok) {
    return null;
  }

  const pollVotes = pollVotesResults.Ok;

  const votesToOptions = pollVotes.votesByOptions.map(([idx, votes]) => {
    const votesToPercent = pollVotes.totalVotes !== '0' ? parseInt(votes) / parseInt(pollVotes.totalVotes) : 0;

    return [poll.options[parseInt(idx)], votesToPercent] as [string, number];
  });

  const handleVote = (optionIdx: number) => {
    if (optionIdx === voteOption) {
      setVoteOption(undefined);
      return;
    }

    setVoteOption(optionIdx);
  };

  const isActiveMember = memberStatus === MemberStatus.Active;
  const isExpire = poll.expiredAt && timestampToDate(poll.expiredAt) < now();
  const hideResults = isActiveMember && !pollVotes.votedOption && !isExpire;

  console.log(poll.id, hideResults);

  return (
    <Flex flexDir='column' borderWidth={1} p={4} borderRadius={4} gap={2}>
      <Flex justifyContent='space-between'>
        <Text fontWeight='semibold'>#{poll.id}</Text>
        {isOwner && (
          <Menu placement='bottom'>
            <MenuButton
              as={IconButton}
              aria-label='Menu Button'
              icon={<RiMore2Fill />}
              size='sm'
              variant='ghost'
              mr={-2}
            />
            <MenuList py={0}>
              <EditPollButton poll={poll} />
            </MenuList>
          </Menu>
        )}
      </Flex>
      <Text fontWeight='semibold'>{poll.title}</Text>
      <Flex mt={4} flexDir='column' gap={2}>
        {votesToOptions.map(([option, votes], optionIdx) => (
          <Flex
            key={`${option}${optionIdx}`}
            borderWidth={2}
            borderRadius={8}
            px={2}
            py={1}
            justifyContent='space-between'
            cursor='pointer'
            _hover={{ bg: 'primary.100' }}
            borderColor={optionIdx === voteOption ? 'primary.400' : 'charka-border-color'}
            onClick={() => handleVote(optionIdx)}
            bgGradient={!hideResults ? `linear(to-r, primary.300 ${votes * 100}%, white 0%)` : ''}
            pointerEvents={!isActiveMember || isExpire ? 'none' : 'auto'}>
            <Text>{option}</Text>
            {!hideResults && <Text>{(votes * 100).toFixed(2)}%</Text>}
          </Flex>
        ))}
      </Flex>
      <Flex mt={4} justifyContent='space-between' alignItems='center'>
        <Flex height={4} alignItems='center' gap={2}>
          {!isExpire && (
            <Box>
              {voteOption !== undefined && voteOption.toString() !== pollVotes.votedOption ? (
                <VoteButton pollId={poll.id} optionIndex={voteOption} />
              ) : (
                pollVotes.votedOption && <UnvoteButton pollId={poll.id} />
              )}
            </Box>
          )}
          {poll.expiredAt && (
            <Text fontSize='sm' color='dimgray'>
              End {fromNow(poll.expiredAt)}
            </Text>
          )}
        </Flex>
        <Flex gap={2}>
          <Text fontSize='sm' color='dimgray'>
            {pollVotes.totalVotes} votes
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}

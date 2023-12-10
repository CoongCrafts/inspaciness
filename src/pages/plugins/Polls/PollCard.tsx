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
import pluralize from 'pluralize';

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
    if (!pollVotesResults?.Ok || voteOption !== undefined) {
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
  const votedOption = pollVotes.votedOption ? stringToNum(pollVotes.votedOption) : undefined;
  const isVoted = votedOption !== undefined;

  return (
    <Flex flexDir='column' borderWidth={1} p={4} pt={2} borderRadius={4} gap={2} mb={2}>
      <Flex justifyContent='space-between' align='center'>
        <Text fontWeight='semibold'>Poll #{poll.id}</Text>
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
      <Text>{poll.title}</Text>
      <Flex mt={2} flexDir='column' gap={2}>
        {votesToOptions.map(([option, votes], optionIdx) => (
          <Flex
            key={`${option}${optionIdx}`}
            borderWidth={1}
            borderRadius={4}
            px={2}
            py={1}
            justifyContent='space-between'
            cursor='pointer'
            transitionDuration='200ms'
            borderColor={optionIdx === voteOption ? 'primary.400' : 'charka-border-color'}
            onClick={() => handleVote(optionIdx)}
            bgGradient={`linear(to-r, ${votedOption === optionIdx ? 'primary.200' : 'primary.100'} ${
              votes * 100
            }%, white 0%)`}
            pointerEvents={!isActiveMember || isExpire ? 'none' : 'auto'}>
            <Text>{option}</Text>
            <Text>{(votes * 100).toFixed(2)}%</Text>
          </Flex>
        ))}
      </Flex>
      <Flex mt={2} justifyContent='space-between' align='center'>
        <Flex align='center' gap={2}>
          {!isExpire && isActiveMember && (
            <Box>
              {isVoted && voteOption === votedOption ? (
                <UnvoteButton pollId={poll.id} />
              ) : (
                <VoteButton label={isVoted ? 'Change Vote' : 'Vote'} pollId={poll.id} optionIndex={voteOption} />
              )}
            </Box>
          )}
          {!isExpire && poll.expiredAt && (
            <Text fontSize='sm' color='dimgray'>
              Ends {fromNow(poll.expiredAt)}
            </Text>
          )}
          {isExpire && (
            <Text fontSize='sm' color='dimgray'>
              Final results
            </Text>
          )}
        </Flex>
        <Flex gap={2}>
          <Text fontSize='sm' color='dimgray'>
            {pollVotes.totalVotes} {pluralize('vote', stringToNum(pollVotes.totalVotes))}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}

import { Box, Flex, Link, Tag, Text } from '@chakra-ui/react';
import PollsCardSkeleton from '@/components/sketeton/PollsCardSkeleton';
import PollCard from '@/pages/plugins/Polls/0.1.x/PollCard';
import { usePollsContext } from '@/pages/plugins/Polls/0.1.x/PollsProvider';
import NewPollButton from '@/pages/plugins/Polls/0.1.x/actions/NewPollButton';
import { useSpaceContext } from '@/pages/space/0.1.x/SpaceProvider';
import { eventEmitter, EventName } from '@/utils/eventemitter';

export default function PollsView() {
  const { isOwner } = useSpaceContext();
  const { pollsCount, polls } = usePollsContext();

  return (
    <Box mb={4}>
      <Flex justifyContent='space-between' alignItems='center' gap={2} mb={4}>
        <Flex alignItems='center' gap={2}>
          <Text fontSize='xl' fontWeight='semibold'>
            Polls
          </Text>
          <Tag>{pollsCount}</Tag>
        </Flex>
        {isOwner && <NewPollButton />}
      </Flex>
      {pollsCount === 0 &&
        polls &&
        (isOwner ? (
          <Text>
            There are no polls in this space,{' '}
            <Link onClick={() => eventEmitter.emit(EventName.SHOW_NEW_POLL_POPUP)} color='primary.500'>
              create a new poll
            </Link>{' '}
            now!
          </Text>
        ) : (
          <Text>There are no polls in this space, check back later.</Text>
        ))}
      {polls
        ? polls.map((poll) => <PollCard key={poll.id} poll={poll} />)
        : [...Array(5)].map((_, idx) => <PollsCardSkeleton key={idx} />)}
    </Box>
  );
}

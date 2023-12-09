import { Flex, Link, Tag, Text } from '@chakra-ui/react';
import PollsCardSkeleton from '@/components/sketeton/PollsCardSkeleton';
import PollCard from '@/pages/plugins/Polls/PollCard';
import { usePollsContext } from '@/pages/plugins/Polls/PollsProvider';
import NewPollButton from '@/pages/plugins/Polls/actions/NewPollButton';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { eventEmitter, EventName } from '@/utils/eventemitter';

export default function PollsView() {
  const { isOwner } = useSpaceContext();
  const { pollsCount, polls } = usePollsContext();

  return (
    <Flex flexDir='column'>
      <Flex justifyContent='space-between' alignItems='center' gap={2}>
        <Flex alignItems='center' gap={2}>
          <Text fontSize='xl' fontWeight='semibold'>
            Polls
          </Text>
          <Tag>{pollsCount}</Tag>
        </Flex>
        {isOwner && <NewPollButton />}
      </Flex>
      <Flex mt={4} flexDir='column' gap={2}>
        {polls
          ? polls.map((poll) => <PollCard key={poll.id} poll={poll} />)
          : [...Array(5)].map((_, idx) => <PollsCardSkeleton key={idx} />)}
      </Flex>
      {pollsCount === 0 &&
        (isOwner ? (
          <Text>
            There are no posts in this space,{' '}
            <Link onClick={() => eventEmitter.emit(EventName.SHOW_NEW_POLL_POPUP)} color='primary.500'>
              create a new post
            </Link>{' '}
            now!
          </Text>
        ) : (
          <Text>There are no poll in this space, check back later.</Text>
        ))}
    </Flex>
  );
}

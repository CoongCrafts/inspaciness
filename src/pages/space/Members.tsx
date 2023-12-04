import { Box, Flex, IconButton, SimpleGrid, Tag, Text } from '@chakra-ui/react';
import usePagination from '@/hooks/usePagination';
import MemberCard from '@/pages/space/MemberCard';
import InviteMemberButton from '@/pages/space/actions/InviteMemberButton';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { MemberRecord } from '@/types';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

export default function Members() {
  const { membersCount, isOwner } = useSpaceContext();
  const { pageIndex, setPageIndex, numberOfPage, items } = usePagination<MemberRecord>('listMembers', 9);

  return (
    <Flex flexDirection='column'>
      <Flex align='center' mb={4} gap={2} justify={'space-between'}>
        <Flex gap={2} align='center'>
          <Text fontSize='xl' fontWeight='semibold'>
            Members
          </Text>
          <Box>
            <Tag>{membersCount}</Tag>
          </Box>
        </Flex>
        {isOwner && <InviteMemberButton />}
      </Flex>
      <SimpleGrid flexGrow={1} columns={{ base: 1, lg: 2 }} gap={2}>
        {items.map((item) => (
          <MemberCard key={item.index} memberRecord={item} />
        ))}
      </SimpleGrid>
      <Flex mt={4} justifyContent='space-between' align='center'>
        <Text fontSize='sm'>{`Page ${pageIndex} / ${numberOfPage}`}</Text>
        <Flex alignItems='center' gap={2}>
          <IconButton
            onClick={() => setPageIndex((pre) => pre - 1)}
            aria-label='Back'
            size='sm'
            icon={<ChevronLeftIcon fontSize='1.2rem' />}
            isDisabled={pageIndex === 1}
          />
          <IconButton
            onClick={() => setPageIndex((pre) => pre + 1)}
            aria-label='Next'
            size='sm'
            icon={<ChevronRightIcon fontSize='1.2rem' />}
            isDisabled={pageIndex === numberOfPage}
          />
        </Flex>
      </Flex>
    </Flex>
  );
}

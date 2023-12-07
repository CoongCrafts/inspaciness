import { Box, Flex, SimpleGrid, Skeleton, SkeletonCircle } from '@chakra-ui/react';
import MemberCardSkeleton from '@/components/sketeton/MemberCardSkeleton';

export default function SpaceSkeleton() {
  return (
    <Box my={3}>
      <Flex gap={6} align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }}>
        <Box>
          <SkeletonCircle size='24' />
        </Box>
        <Box flex={1}>
          <Skeleton height='22px' mb={2} w={{ base: 120, sm: 200 }} />
          <Skeleton height='16px' mb={2} w={{ base: 100, sm: 180 }} />
          <Skeleton height='16px' mb={2} w={{ base: '100%', md: 480 }} />
        </Box>
      </Flex>
      <Flex gap={4} mt={{ base: 4, md: 6 }}>
        <Box width={200} display={{ base: 'none', md: 'block' }}>
          <Skeleton height='24px' mb={2} w={200} />
          <Skeleton height='24px' mb={2} w={200} />
          <Skeleton height='24px' mb={2} w={200} />
          <Skeleton height='24px' mb={2} w={200} />
          <Skeleton height='24px' mb={2} w={200} />
          <Skeleton height='24px' mb={2} w={200} />
          <Skeleton height='24px' mb={2} w={200} />
          <Skeleton height='24px' mb={2} w={200} />
        </Box>
        <Box flex={1}>
          <Skeleton height='28px' mb={4} w={{ base: 180, sm: 250 }} />
          <SimpleGrid flexGrow={1} columns={{ base: 1, lg: 2 }} gap={2}>
            {[...Array(6)].map((_, idx) => (
              <MemberCardSkeleton key={idx} />
            ))}
          </SimpleGrid>
        </Box>
      </Flex>
    </Box>
  );
}

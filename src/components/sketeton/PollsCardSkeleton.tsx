import { Box, Flex, Skeleton, SkeletonText } from '@chakra-ui/react';

export default function PollsCardSkeleton() {
  return (
    <Box border='1px' borderRadius={4} borderColor='chakra-border-color' mb={2} p={4}>
      <Skeleton width={8} height={8} borderRadius={8} />
      <SkeletonText mt='4' noOfLines={4} spacing='2' skeletonHeight='2' />
      <Flex mt={4} flexDir='column' gap={2}>
        <Skeleton height={8} borderRadius={8} />
        <Skeleton height={8} borderRadius={8} />
        <Skeleton height={8} borderRadius={8} />
      </Flex>
      <Flex mt={4} justifyContent='space-between'>
        <Skeleton width={40} height={6} borderRadius={8} />
        <Skeleton width={20} height={6} borderRadius={8} />
      </Flex>
    </Box>
  );
}

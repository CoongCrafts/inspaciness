import { Flex, Skeleton, SkeletonCircle, SkeletonText } from '@chakra-ui/react';

export default function SpaceCardSkeleton() {
  return (
    <Skeleton borderRadius={4} padding='6' boxShadow='md' startColor='gray.200' endColor='gray.300'>
      <Skeleton mb={4} noOfLines={1} height='20px' />
      <Flex justify='center'>
        <SkeletonCircle size='20' />
      </Flex>
      <SkeletonText mt={4} noOfLines={1} mx={8} />
    </Skeleton>
  );
}

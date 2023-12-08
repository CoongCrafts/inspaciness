import { Box, Flex, Skeleton, SkeletonCircle, SkeletonText } from '@chakra-ui/react';

export default function SpaceCardSkeleton() {
  return (
    <Box border='1px' borderRadius={4} borderColor='chakra-border-color' mb={2} p={4}>
      <Skeleton mb={4} noOfLines={1} height='20px' mx={6} />
      <Flex justify='center'>
        <SkeletonCircle size='20' />
      </Flex>
      <SkeletonText mt={4} noOfLines={1} mx={10} />
    </Box>
  );
}

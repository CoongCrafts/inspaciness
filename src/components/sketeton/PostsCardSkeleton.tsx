import { Box, Flex, Skeleton, SkeletonCircle, SkeletonText } from '@chakra-ui/react';

export default function PostsCardSkeleton() {
  return (
    <Box border='1px' borderRadius={4} borderColor='chakra-border-color' mb={2} p={4}>
      <Flex alignItems='center' gap={2}>
        <SkeletonCircle size='8' />
        <Box>
          <Skeleton height='12px' width='32' mb={2} />
          <Skeleton height='8px' width='20' />
        </Box>
      </Flex>
      <SkeletonText mt='4' noOfLines={4} spacing='2' skeletonHeight='2' />
    </Box>
  );
}

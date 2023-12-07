import { Box, Flex, Skeleton, SkeletonCircle, SkeletonText } from '@chakra-ui/react';

export default function PostsCardSkeleton() {
  return (
    <Box padding='6' boxShadow='lg' bg='white'>
      <Flex alignItems='center' gap={2}>
        <SkeletonCircle size='10' />
        <Skeleton height='10' width='20' />
      </Flex>
      <SkeletonText mt='4' noOfLines={4} spacing='4' skeletonHeight='2' />
    </Box>
  );
}

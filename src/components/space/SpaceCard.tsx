import { Box, Heading, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import SpaceAvatar from '@/components/space/SpaceAvatar';
import useSpace from '@/hooks/useSpace';
import { OnChainSpace, Props } from '@/types';
import { ChakraProps } from '@chakra-ui/system';
import pluralize from 'pluralize';

interface SpaceCardProps extends Props, ChakraProps {
  space: OnChainSpace;
}

export default function SpaceCard({ space, ...props }: SpaceCardProps) {
  const navigate = useNavigate();
  const { info, membersCount } = useSpace(space);

  return (
    <Box
      textAlign='center'
      border='1px'
      borderColor='chakra-border-color'
      p={4}
      borderRadius={4}
      transitionDuration='200ms'
      _hover={{ borderColor: 'gray.400' }}
      cursor='pointer'
      onClick={() => navigate(`/${space.chainId}/spaces/${space.address}`)}
      {...props}>
      <Heading mb={4} size='md' overflow='hidden' whiteSpace='nowrap' textOverflow='ellipsis'>
        {info?.name}
      </Heading>
      {info && <SpaceAvatar info={info} space={space} />}

      <Text fontSize='sm' fontWeight='semibold' mt={4}>
        {membersCount} {pluralize('member', membersCount)}
      </Text>
    </Box>
  );
}

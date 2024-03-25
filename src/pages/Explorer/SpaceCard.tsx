import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import SpaceAvatar from '@/components/space/SpaceAvatar';
import useSpace from '@/hooks/useSpace';
import SpaceProvider from '@/pages/space/0.1.x/SpaceProvider';
import CancelRequestButton from '@/pages/space/0.1.x/actions/CancelRequestButton';
import JoinButton from '@/pages/space/0.1.x/actions/JoinButton';
import { OnChainSpace, Props, RegistrationType } from '@/types';
import pluralize from 'pluralize';
import { ChainContract } from 'useink';

interface SpaceCardProps extends Props {
  space: OnChainSpace;
  motherContract?: ChainContract;
}

export default function SpaceCard({ space, motherContract }: SpaceCardProps) {
  const navigate = useNavigate();
  const { info, config, membersCount, pendingRequest } = useSpace(space);

  const showJoinButton = config?.registration !== RegistrationType.InviteOnly;

  if (!info) return null;

  return (
    <SpaceProvider space={space} motherContract={motherContract}>
      <Flex
        flexDir='column'
        alignItems='center'
        textAlign='center'
        border='1px'
        borderColor='chakra-border-color'
        p={4}
        borderRadius={4}
        transitionDuration='200ms'
        _hover={{ borderColor: 'gray.400' }}
        cursor='pointer'
        onClick={() => navigate(`/${space.chainId}/spaces/${space.address}`)}>
        <Heading mb={4} size='md' noOfLines={1}>
          {info?.name}
        </Heading>
        {info && <SpaceAvatar info={info} space={space} />}

        <Text fontSize='sm' fontWeight='semibold' mt={4}>
          {membersCount} {pluralize('member', membersCount)}
        </Text>
        <Box mt={3}>
          {showJoinButton ? (
            pendingRequest ? (
              <CancelRequestButton buttonProps={{ width: 'fit-content' }} />
            ) : (
              <JoinButton />
            )
          ) : (
            <Button size='sm' isDisabled>
              Invite Only
            </Button>
          )}
        </Box>
      </Flex>
    </SpaceProvider>
  );
}

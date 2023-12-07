import { Box, Button, Flex, SimpleGrid, Tag, Text, Link } from '@chakra-ui/react';
import { useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'react-use';
import NetworkSelection from '@/components/shared/NetworkSelection';
import SpaceCardSkeleton from '@/components/sketeton/SpaceCardSkeleton';
import SpaceCard from '@/components/space/SpaceCard';
import useSpaces from '@/hooks/useSpaces';
import { useWalletContext } from '@/providers/WalletProvider';
import env from '@/utils/env';
import { findNetwork } from '@/utils/networks';
import { ChainId } from 'useink/chains';

export default function MySpaces() {
  const navigate = useNavigate();
  const [chainId, setChainId] = useLocalStorage<ChainId>('myspace/selected_network', env.defaultChainId);
  const { selectedAccount } = useWalletContext();
  const network = findNetwork(chainId!);
  const spaces = useSpaces(chainId!);

  useEffect(() => {
    if (!selectedAccount) {
      navigate('/');
    }
  }, [selectedAccount]);

  return (
    <Box>
      <Flex flex={1} justify='space-between' alignItems='center' mb={4}>
        <Flex align='center' gap={2}>
          <Text fontSize='xl' fontWeight='semibold'>
            My Spaces
          </Text>
          {!!spaces?.length && (
            <Box>
              <Tag colorScheme='gray'>{spaces.length}</Tag>
            </Box>
          )}
        </Flex>
        <Flex gap={2}>
          <NetworkSelection size='sm' responsive onSelect={(one) => setChainId(one.id)} defaultNetwork={network} />
          <Button variant='outline' size='sm' onClick={() => navigate('/launch')}>
            New Space
          </Button>
        </Flex>
      </Flex>

      {spaces?.length === 0 && (
        <Text>
          You have no spaces on{' '}
          <Text as='span' fontWeight='semibold'>
            {network.name}
          </Text>
          , create{' '}
          <Link as={RouterLink} to='/launch' color='primary.500' textDecoration='underline'>
            a new space
          </Link>{' '}
          or{' '}
          <Link as={RouterLink} to='/explore' color='primary.500' textDecoration='underline'>
            join community spaces
          </Link>{' '}
          now.
        </Text>
      )}

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
        {spaces
          ? spaces.map((space) => <SpaceCard space={space} key={space.address} />)
          : [...Array(12)].map((_, idx) => <SpaceCardSkeleton key={idx} />)}
      </SimpleGrid>
    </Box>
  );
}

import { Box, Button, Flex, Tag, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'react-use';
import NetworkSelection from '@/components/shared/NetworkSelection';
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
          {spaces.length > 0 && (
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
      <Flex gap={4} flexWrap='wrap'>
        {spaces?.map((space) => (
          <SpaceCard
            w={{ base: '100%', md: 'calc((100% - 2rem)/3)', lg: 'calc((100% - 3rem)/4)' }}
            space={space}
            key={space.address}
          />
        ))}
      </Flex>
    </Box>
  );
}

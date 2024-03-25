import { Box, Button, Divider, Flex, SimpleGrid, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useLocalStorage, useToggle, useWindowScroll } from 'react-use';
import NetworkSelection from '@/components/shared/NetworkSelection';
import SpaceCardSkeleton from '@/components/sketeton/SpaceCardSkeleton';
import useMotherContract from '@/hooks/contracts/useMotherContract';
import usePagination from '@/hooks/usePagination';
import SpaceCard from '@/pages/Explorer/SpaceCard';
import { CodeHash, NetworkInfo, SpaceId } from '@/types';
import env from '@/utils/env';
import { findNetwork } from '@/utils/networks';
import pluralize from 'pluralize';
import { ChainId } from 'useink/chains';

const RECORD_PER_PAGE = 3 * 4;

interface ChainExplorerProps {
  chainId: ChainId;
  setChainId: (chainId: ChainId) => void;
}

export function ChainExplorer({ chainId, setChainId }: ChainExplorerProps) {
  const network = findNetwork(chainId!);
  const contract = useMotherContract(network.id);
  const [loadMore, toggleLoadMore] = useToggle(false);
  const [onLoad, setOnLoad] = useToggle(true);
  const [spaceIds, setSpaceIds] = useState<[SpaceId, CodeHash][]>();
  const {
    items,
    setPageIndex,
    pageIndex,
    total: numberOfSpace,
    hasNextPage = false,
  } = usePagination<[SpaceId, CodeHash]>(contract, 'listSpaces', RECORD_PER_PAGE);
  const { y } = useWindowScroll();

  useEffect(() => {
    if (onLoad && items) {
      setOnLoad(false);
      setSpaceIds((preState = []) => [...preState, ...items]);
    }
  }, [items]);

  useEffect(() => {
    if (!loadMore || onLoad || !hasNextPage) return;

    // When the current view bottom -> the bottom of web <= 50 pixel
    if (document.body.offsetHeight - y - innerHeight <= 50) {
      setOnLoad(true);
      setPageIndex(pageIndex + 1);
    }
  }, [loadMore, onLoad, y]);

  const handleSetNetwork = (network: NetworkInfo) => {
    setChainId(network.id);
  };

  return (
    <Box key={network.id} mb={8}>
      <Flex flex={1} justify='center' alignItems='center' mb={4}>
        <Text fontSize={{ base: 'xl', md: '3xl' }} fontWeight='semibold' textAlign='center'>
          Find your communities on InSpace 🥳
        </Text>
      </Flex>
      <Flex justifyContent='space-between' alignItems='center' flexGrow={1}>
        <Flex align='center' gap={1}>
          <Text fontWeight='semibold'>Network: </Text>
          <NetworkSelection responsive size='sm' onSelect={handleSetNetwork} defaultNetwork={network} />
        </Flex>
        <Text color='dimgray' fontWeight='semibold' whiteSpace='nowrap'>
          {`${numberOfSpace} ${pluralize('space', numberOfSpace)} `}
        </Text>
      </Flex>
      <Divider my={4} />

      {spaceIds?.length === 0 && (
        <Text>
          There are no community spaces on{' '}
          <Text as='span' fontWeight='semibold'>
            {network.name}
          </Text>
        </Text>
      )}

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
        {spaceIds
          ? spaceIds.map(([spaceId, codeHash]) => (
              <SpaceCard
                class='space-card'
                key={spaceId}
                space={{ address: spaceId, chainId, codeHash }}
                chainId={network.id}
                motherContract={contract}
              />
            ))
          : [...Array(12)].map((_, idx) => <SpaceCardSkeleton key={idx} />)}
      </SimpleGrid>
      {onLoad && spaceIds?.length && (
        <Box mt={4} textAlign='center'>
          <Spinner />
        </Box>
      )}
      {hasNextPage && spaceIds?.length && !loadMore && (
        <Box mt={4} textAlign='center'>
          <Button onClick={toggleLoadMore} variant='outline' width={200}>
            Load more
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default function Explorer() {
  const [chainId, setChainId] = useLocalStorage<ChainId>('myspace/selected_network', env.defaultChainId);

  return <ChainExplorer key={chainId!} chainId={chainId!} setChainId={setChainId} />;
}

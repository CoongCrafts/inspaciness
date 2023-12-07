import { Box, Button, Divider, Flex, SimpleGrid, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useLocalStorage, useToggle, useWindowScroll } from 'react-use';
import NetworkSelection from '@/components/shared/NetworkSelection';
import useMotherContract from '@/hooks/contracts/useMotherContract';
import usePagination from '@/hooks/usePagination';
import SpaceCard from '@/pages/Explorer/SpaceCard';
import { NetworkInfo, SpaceId } from '@/types';
import { findNetwork } from '@/utils/networks';
import pluralize from 'pluralize';
import { ChainId, Development } from 'useink/chains';

const RECORD_PER_PAGE = 3 * 4;

export default function Explorer() {
  const [chainId, setChainId] = useLocalStorage<ChainId>('myspace/selected_network', Development.id);
  const network = findNetwork(chainId!);
  const contract = useMotherContract(network.id);
  const [loadMore, toggleLoadMore] = useToggle(false);
  const [onLoad, setOnLoad] = useToggle(true);
  const [storage, setStorage] = useState<SpaceId[]>([]);
  const {
    items,
    setPageIndex,
    pageIndex,
    total: numberOfSpace,
    hasNextPage = false,
  } = usePagination<SpaceId>(contract, 'listSpaces', RECORD_PER_PAGE, false);
  const { y } = useWindowScroll();

  useEffect(() => {
    if (onLoad && items) {
      setOnLoad(false);
      setStorage((preState) => [...preState, ...items]);
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

  useEffect(() => {
    toggleLoadMore(false);
    setOnLoad(true);
    setPageIndex(1);
  }, [chainId]);

  const handleSetNetwork = (network: NetworkInfo) => {
    setStorage([]);
    setChainId(network.id);
  };

  return (
    <Box mb={8}>
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
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
        {storage.map((spaceId) => (
          <SpaceCard class='space-card' key={spaceId} spaceId={spaceId} chainId={network.id} />
        ))}
      </SimpleGrid>
      {onLoad && (
        <Box mt={4} textAlign='center'>
          <Spinner />
        </Box>
      )}
      {hasNextPage && !loadMore && (
        <Box mt={4} textAlign='center'>
          <Button onClick={toggleLoadMore} variant='outline' width={200}>
            Load more
          </Button>
        </Box>
      )}
    </Box>
  );
}

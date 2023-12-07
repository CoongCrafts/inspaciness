import {
  Avatar,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Text,
  useMediaQuery,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ChainEnvironment, ChainEnvironments, NetworkInfo, Props } from '@/types';
import env from '@/utils/env';
import { SUPPORTED_NETWORKS } from '@/utils/networks';
import { ChevronDownIcon } from '@chakra-ui/icons';

interface NetworkSelectionProps extends Props {
  onSelect?: (network: NetworkInfo) => void;
  defaultNetwork?: NetworkInfo;
  size?: string;
  responsive?: boolean;
  disabled?: boolean;
  checkMotherAddress?: boolean;
}

export default function NetworkSelection({
  onSelect,
  defaultNetwork,
  size,
  responsive = false,
  disabled = false,
  checkMotherAddress = true,
}: NetworkSelectionProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkInfo>();
  const [smallest] = useMediaQuery('(max-width: 600px)');

  useEffect(() => {
    setSelectedNetwork(defaultNetwork);
  }, [defaultNetwork]);

  const doSelect = (network: NetworkInfo) => {
    setSelectedNetwork(network);
    onSelect && onSelect(network);
  };
  const shouldShowNetworkName = !responsive || (responsive && !smallest);

  return (
    <Menu autoSelect={false}>
      <MenuButton
        as={Button}
        minWidth={responsive ? 'auto' : { base: '100%', sm: 300 }}
        size={size}
        variant='outline'
        isDisabled={disabled}
        rightIcon={<ChevronDownIcon />}>
        <Flex direction='row' align='center' gap={2}>
          {selectedNetwork ? (
            <>
              <Avatar size={size == 'sm' ? '2xs' : 'xs'} src={selectedNetwork.logo} mr={1} />
              {shouldShowNetworkName && <span>{selectedNetwork.name}</span>}
            </>
          ) : (
            <Text fontWeight='normal'>Select a network</Text>
          )}
        </Flex>
      </MenuButton>
      <MenuList>
        {ChainEnvironments.map((chainEnv) => {
          if (env.isProd && chainEnv === ChainEnvironment.Development) {
            return null;
          }

          return (
            <MenuGroup key={chainEnv} title={chainEnv}>
              {SUPPORTED_NETWORKS[chainEnv].map((one) => (
                <MenuItem
                  key={one.id}
                  onClick={() => doSelect(one)}
                  isDisabled={checkMotherAddress ? !one.motherAddress : false}
                  backgroundColor={one.id === selectedNetwork?.id ? 'active-menu-item-bg' : ''}>
                  <Flex direction='row' align='center' gap={2}>
                    <Avatar size='xs' src={one.logo} />
                    <span>{one.name}</span>
                  </Flex>
                </MenuItem>
              ))}
            </MenuGroup>
          );
        })}
      </MenuList>
    </Menu>
  );
}

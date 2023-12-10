import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Switch,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import useContractState from '@/hooks/useContractState';
import { useTx } from '@/hooks/useink/useTx';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { Plugin } from '@/types';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { findPlugin } from '@/utils/plugins';
import { shouldDisableStrict } from 'useink/utils';

export default function InstallPluginsButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { motherContract, plugins: installedPlugins = [], space } = useSpaceContext();
  const { state: pluginLaunchers = [] } = useContractState<[string, string][]>(motherContract, 'pluginLaunchers');
  const [pluginsToInstall, setPluginsToInstall] = useState<string[]>([]);
  const installPluginsTx = useTx(motherContract, 'installPlugins');
  const freeBalance = useCurrentFreeBalance();

  const doInstallPlugins = async () => {
    if (pluginsToInstall.length === 0) return;
    if (freeBalance === 0) {
      toast.error(messages.insufficientBalance);
      return;
    }

    installPluginsTx.signAndSend([space.address, pluginsToInstall], {}, (result) => {
      if (!result) {
        installPluginsTx.resetState();
        return;
      }

      notifyTxStatus(result);

      if (result?.isInBlock) {
        if (result.dispatchError) {
          toast.error(messages.txError);
        } else {
          toast.success(`${pluginsToInstall.length.toString().padStart(2, '0')} plugin(s) installed`);
        }

        installPluginsTx.resetState();
        onClose();
      }
    });
  };

  useEffect(() => {
    setPluginsToInstall([]);
    installPluginsTx.resetState();
  }, [isOpen]);

  const availablePlugins = pluginLaunchers
    .map((one) => {
      const [pluginId, _] = one;
      if (installedPlugins.some((p) => p.id === pluginId)) return null;

      return findPlugin(pluginId);
    })
    .filter((p) => !!p) as Plugin[];

  return (
    <>
      <Button onClick={onOpen} size='xs' variant='outline'>
        Install plugins
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'lg' }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Install plugins</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {availablePlugins.length > 0 ? (
              <Text>Available plugins to install.</Text>
            ) : (
              <Text>There are no available plugins to install. More to come soon, check back later!</Text>
            )}

            <Flex mt={4} direction='column' gap={2}>
              {availablePlugins.map((one, index) => (
                <Box key={index}>
                  <FormControl>
                    <Flex align='center'>
                      <FormLabel mb='0'>{one.name}</FormLabel>
                      <Switch
                        colorScheme='primary'
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const plugins = pluginsToInstall.filter((id) => id !== one.id);
                          if (checked) {
                            plugins.push(one.id);
                          }

                          setPluginsToInstall(plugins);
                        }}
                        isChecked={pluginsToInstall.includes(one.id)}
                      />
                    </Flex>

                    <Text fontSize='sm' color='gray.500'>
                      {one.description}
                    </Text>
                  </FormControl>
                  {index < availablePlugins.length - 1 && <Divider mt={2} />}
                </Box>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            {availablePlugins.length > 0 && (
              <Button
                width={120}
                type='submit'
                onClick={doInstallPlugins}
                colorScheme='primary'
                isLoading={shouldDisableStrict(installPluginsTx)}
                loadingText='Installing'
                isDisabled={pluginsToInstall.length === 0}>
                Install
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

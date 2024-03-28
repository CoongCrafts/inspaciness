import {
  Box,
  Button,
  ButtonProps,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tag,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import usePluginContract from '@/hooks/contracts/plugins/usePluginContract';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import { useTx } from '@/hooks/useink/useTx';
import { PluginInfo, Props } from '@/types';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { findPluginMetadata, findPluginVersion } from '@/utils/plugins';
import { shortenAddress } from '@/utils/string';
import { shouldDisableStrict } from 'useink/utils';

interface UpgradePluginButtonProps extends Props {
  pluginInfo: PluginInfo;
  currentCodeHash: string;
  latestCodeHash: string;
  buttonProps?: ButtonProps;
}

export default function UpgradePluginButton({
  pluginInfo,
  currentCodeHash,
  latestCodeHash,
  buttonProps = {},
}: UpgradePluginButtonProps) {
  const { contract: pluginContract } = usePluginContract(pluginInfo);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const setCodeHashTx = useTx(pluginContract, 'pluginBase::setCodeHash');
  const freeBalance = useCurrentFreeBalance();

  const doUpgrade = async () => {
    if (freeBalance === 0) {
      toast.error(messages.insufficientBalance);
      return;
    }

    setCodeHashTx.signAndSend([latestCodeHash], {}, (result) => {
      if (!result) {
        setCodeHashTx.resetState();
        return;
      }

      notifyTxStatus(result);

      if (result?.isInBlock) {
        if (result.dispatchError) {
          toast.error(messages.txError);
        } else {
          toast.success('Plugin version upgraded');
        }

        setCodeHashTx.resetState();
        onClose();
      }
    });
  };

  useEffect(() => {
    setCodeHashTx.resetState();
  }, [isOpen]);

  const currentVersion = findPluginVersion({ ...pluginInfo, codeHash: currentCodeHash });
  const latestVersion = findPluginVersion({ ...pluginInfo, codeHash: latestCodeHash });
  const latestChangelog = findPluginMetadata({ ...pluginInfo, codeHash: latestCodeHash })?.changelog;

  return (
    <>
      <Button onClick={onOpen} size='xs' variant='outline' colorScheme='red' {...buttonProps}>
        Upgrade
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'md' }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upgrade Plugin: {pluginInfo.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              New version of the plugin <b>{pluginInfo.name}</b> is available to upgrade.
            </Text>
            <Text mb={2}>
              Current Version:{' '}
              <Tag variant='solid' colorScheme='gray'>
                v{currentVersion} - {shortenAddress(currentCodeHash)}
              </Tag>
            </Text>
            <Text>
              New Version:{' '}
              <Tag variant='solid' colorScheme='green'>
                v{latestVersion} - {shortenAddress(latestCodeHash)}
              </Tag>
            </Text>
            {latestChangelog && (
              <Box>
                <Text mt={2}>Changes in the new version:</Text>
                <Box dangerouslySetInnerHTML={{ __html: latestChangelog }}></Box>
              </Box>
            )}
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' onClick={doUpgrade} colorScheme='red' isLoading={shouldDisableStrict(setCodeHashTx)}>
              Upgrade
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

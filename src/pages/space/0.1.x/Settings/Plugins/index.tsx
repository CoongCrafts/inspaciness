import { Box, Button, Divider, Flex, Tag, Text } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import useContractState from '@/hooks/useContractState';
import { useTx } from '@/hooks/useink/useTx';
import PostConfig from '@/pages/space/0.1.x/Settings/Plugins/PostConfig';
import { useSpaceContext } from '@/pages/space/0.1.x/SpaceProvider';
import InstallPluginsButton from '@/pages/space/0.1.x/actions/InstallPluginsButton';
import UpgradePluginButton from '@/pages/space/0.1.x/actions/UpgradePluginButton';
import { PluginInfo } from '@/types';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { PLUGIN_POSTS } from '@/utils/plugins';
import { RustResult, shouldDisableStrict } from 'useink/utils';

interface PluginProp {
  info: PluginInfo;
}

function Plugin({ info }: PluginProp) {
  const { isOwner, contract, motherContract } = useSpaceContext();
  const freeBalance = useCurrentFreeBalance();
  const { state: latestHashCodeResult } = useContractState<RustResult<string, any>>(
    motherContract,
    'latestPluginCode',
    [info.id],
  );

  const disablePluginTx = useTx(contract, 'disablePlugin');
  const enablePluginTx = useTx(contract, 'enablePlugin');

  if (!info) {
    return null;
  }

  const currentHashCode = info.codeHash;
  const { Ok: latestHashCode } = latestHashCodeResult || {};

  const hasNewVersion = !!latestHashCode && !!currentHashCode && latestHashCode !== currentHashCode;

  const disable = (pluginId: string) => {
    if (freeBalance === 0) {
      toast.error(messages.insufficientBalance);
      return;
    }

    disablePluginTx.resetState();
    disablePluginTx.signAndSend([pluginId], {}, (result) => {
      if (!result) {
        disablePluginTx.resetState();
        return;
      }

      notifyTxStatus(result);

      if (result?.isInBlock) {
        if (result.dispatchError) {
          toast.error(result.dispatchError.toString());
        } else {
          toast.success(`Plugin ${info.name} disabled`);
        }

        disablePluginTx.resetState();
      }
    });
  };

  const enable = (pluginId: string) => {
    if (freeBalance === 0) {
      toast.error(messages.insufficientBalance);
      return;
    }

    enablePluginTx.resetState();
    enablePluginTx.signAndSend([pluginId], {}, (result) => {
      if (!result) {
        enablePluginTx.resetState();
        return;
      }

      notifyTxStatus(result);

      if (result?.isInBlock) {
        if (result.dispatchError) {
          toast.error(messages.txError);
        } else {
          toast.success(`Plugin ${info.name} enabled`);
        }

        enablePluginTx.resetState();
      }
    });
  };

  const shouldDisable = info.disabled ? shouldDisableStrict(enablePluginTx) : shouldDisableStrict(disablePluginTx);

  return (
    <>
      <Flex
        py={4}
        justify='space-between'
        align={{ base: 'start', sm: 'center' }}
        borderRadius={4}
        gap={4}
        direction={{ base: 'column', sm: 'row' }}>
        <Box>
          <Flex gap={2} wrap='wrap' alignItems='center'>
            <Text fontSize='lg'>{info.name}</Text>
            <Box>
              <Tag>v{info.version}</Tag>
            </Box>
            {info.disabled && (
              <Box>
                <Tag colorScheme='red'>Disabled</Tag>
              </Box>
            )}
          </Flex>
          <Text fontSize='sm' color='gray.500'>
            {info.description}
          </Text>
        </Box>
        {isOwner && (
          <Flex gap={2}>
            {hasNewVersion && !info.disabled && (
              <UpgradePluginButton
                pluginInfo={info}
                currentCodeHash={currentHashCode!}
                latestCodeHash={latestHashCode!}
              />
            )}
            <Button
              variant='outline'
              size='xs'
              colorScheme={info.disabled ? 'green' : 'red'}
              isLoading={shouldDisable}
              onClick={info.disabled ? () => enable(info.id) : () => disable(info.id)}>
              {info.disabled ? 'Enable' : 'Disable'}
            </Button>
          </Flex>
        )}
      </Flex>
      {info.id === PLUGIN_POSTS && <PostConfig pluginInfo={info} />}
    </>
  );
}

export default function Plugins() {
  const { info, plugins, isOwner } = useSpaceContext();
  if (!info) {
    return null;
  }

  return (
    <Box mt={3} borderWidth={1} borderColor='chakra-border-color' p={4} borderRadius={4} mb={4}>
      <Flex justify='space-between' align='center'>
        <Text fontWeight='semibold'>Plugins</Text>
        <Box>{isOwner && <InstallPluginsButton />}</Box>
      </Flex>
      <Box>
        {plugins?.map((one, index) => (
          <Box key={`${one.id}-${one.codeHash}`}>
            <Plugin info={one} />
            {index < plugins.length - 1 && <Divider />}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

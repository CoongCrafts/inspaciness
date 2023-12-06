import { Badge, Box, Button, Divider, Flex, Text } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import { useTx } from '@/hooks/useink/useTx';
import InstallPluginsButton from '@/pages/space/actions/InstallPluginsButton';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { PluginInfo } from '@/types';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { shouldDisableStrict } from 'useink/utils';

interface PluginProp {
  info: PluginInfo;
}

function Plugin({ info }: PluginProp) {
  const { isOwner, contract } = useSpaceContext();
  const freeBalance = useCurrentFreeBalance();
  const disablePluginTx = useTx(contract, 'disablePlugin');
  const enablePluginTx = useTx(contract, 'enablePlugin');

  if (!info) {
    return null;
  }

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
    <Flex py={4} justify='space-between' align='center' borderRadius={4}>
      <Box>
        <Flex gap={2}>
          <Text fontSize='lg'>{info.name}</Text>
          {info.disabled && (
            <Box>
              <Badge size='xs' variant='solid' colorScheme='red'>
                Disabled
              </Badge>
            </Box>
          )}
        </Flex>
        <Text fontSize='sm' color='gray.500'>
          {info.description}
        </Text>
      </Box>
      <Box>
        {isOwner && (
          <Button
            variant='outline'
            size='xs'
            colorScheme={info.disabled ? 'green' : 'red'}
            isLoading={shouldDisable}
            onClick={info.disabled ? () => enable(info.id) : () => disable(info.id)}>
            {info.disabled ? 'Enable' : 'Disable'}
          </Button>
        )}
      </Box>
    </Flex>
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
          <Box key={one.id}>
            <Plugin info={one} />
            {index < plugins.length - 1 && <Divider />}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

import { Badge, Box, Button, Flex, Text } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import useFlipperContract from '@/hooks/contracts/plugins/useFlipperContract';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import useContractState from '@/hooks/useContractState';
import { useTx } from '@/hooks/useink/useTx';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { MemberStatus, PluginInfo, Props } from '@/types';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { PLUGIN_FLIPPER } from '@/utils/plugins';
import { shouldDisableStrict } from 'useink/utils';

interface FlipperContentProps extends Props {
  info: PluginInfo;
}
function FlipperContent({ info }: FlipperContentProps) {
  const { memberStatus } = useSpaceContext();
  const { contract } = useFlipperContract(info);
  const { state: value } = useContractState<boolean>(contract, 'get');
  const flipTx = useTx(contract, 'flip');
  const freeBalance = useCurrentFreeBalance();

  const flip = () => {
    if (freeBalance === 0) {
      toast.error(messages.insufficientBalance);
      return;
    }

    flipTx.signAndSend([], {}, (result) => {
      if (!result) {
        flipTx.resetState();
        return;
      }

      notifyTxStatus(result);

      if (result.isInBlock) {
        if (result.dispatchError) {
          toast.error(messages.txError);
        } else {
          toast.success('Value flipped');
        }

        flipTx.resetState();
      }
    });
  };

  const isActiveMember = memberStatus === MemberStatus.Active;

  return (
    <Box>
      <Flex gap={2}>
        <Box>
          <Text fontSize='xl' fontWeight='semibold'>
            Flipper
          </Text>
          <Text mt={1} color='gray'>
            {info.description}
          </Text>
        </Box>
      </Flex>
      <Box mt={4}>
        <Text>
          Current value:{' '}
          {value !== undefined && (
            <Badge variant='solid' colorScheme={value ? 'green' : 'red'}>
              {value ? 'TRUE' : 'FALSE'}
            </Badge>
          )}
        </Text>

        <Button
          size='sm'
          colorScheme='primary'
          isLoading={shouldDisableStrict(flipTx)}
          isDisabled={!isActiveMember}
          width={100}
          mt={4}
          onClick={flip}>
          Flip
        </Button>
        {!isActiveMember && (
          <Text mt={2} color='gray' fontSize='sm'>
            Only active member can flip the value
          </Text>
        )}
      </Box>
    </Box>
  );
}

export default function Flipper() {
  const { plugins } = useSpaceContext();
  const plugin = plugins?.find((p) => p.id === PLUGIN_FLIPPER);
  if (!plugin) {
    return null;
  }

  if (plugin.disabled) {
    return (
      <Box>
        <Text>This feature is disabled</Text>
      </Box>
    );
  }

  return <FlipperContent info={plugin} />;
}

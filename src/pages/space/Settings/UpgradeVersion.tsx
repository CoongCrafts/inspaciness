import { Box, Button, Tag, Text } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import useContractState from '@/hooks/useContractState';
import { useTx } from '@/hooks/useink/useTx';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { shortenAddress } from '@/utils/string';
import { shouldDisableStrict } from 'useink/utils';

export default function UpgradeVersion() {
  const { motherContract, codeHash, contract, isOwner } = useSpaceContext();
  const { state: latestSpaceCode } = useContractState<string>(motherContract, 'latestSpaceCode');
  const freeBalance = useCurrentFreeBalance();

  const setCodeHashTx = useTx(contract, 'upgradeable::setCodeHash');

  const hasNewVersion = codeHash !== latestSpaceCode;

  const upgradeToLatestVersion = async () => {
    if (!hasNewVersion) return;

    const confirm = window.confirm('Are you sure to upgrade the space to latest version?');
    if (!confirm) return;

    if (freeBalance == 0) {
      toast.error(messages.insufficientBalance);
      return;
    }

    setCodeHashTx.signAndSend([latestSpaceCode], {}, (result) => {
      if (!result) {
        setCodeHashTx.resetState();
        return;
      }

      notifyTxStatus(result);

      if (result?.isInBlock) {
        if (result.dispatchError) {
          toast.error(messages.txError);
        } else {
          toast.success('Space version upgraded');
        }

        setCodeHashTx.resetState();
      }
    });
  };

  if (!(codeHash && latestSpaceCode)) {
    return null;
  }

  return (
    <Box mt={3} border='1px' borderColor='gray.200' p={4} borderRadius={4} mb={4}>
      <Text fontWeight='semibold'>Version & Upgrade</Text>
      <Box>
        <Text mt={3}>
          {hasNewVersion ? 'Current version' : 'The space is currently at latest version'}{' '}
          <Tag variant='solid' colorScheme={hasNewVersion ? 'gray' : 'green'}>
            {shortenAddress(codeHash)}
          </Tag>
        </Text>

        {isOwner && hasNewVersion && (
          <>
            <Text mt={3}>
              New version is available to upgrade:{' '}
              <Tag variant='solid' colorScheme='green'>
                {shortenAddress(latestSpaceCode)}
              </Tag>
            </Text>
            <Button
              variant='outline'
              mt={4}
              size='sm'
              colorScheme='red'
              onClick={upgradeToLatestVersion}
              isLoading={shouldDisableStrict(setCodeHashTx)}>
              Upgrade Now
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}

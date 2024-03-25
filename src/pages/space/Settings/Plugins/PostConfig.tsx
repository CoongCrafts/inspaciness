import { Box, Button, FormControl, FormHelperText, FormLabel, Select } from '@chakra-ui/react';
import { ChangeEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import usePluginContract from '@/hooks/contracts/plugins/usePluginContract';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import useContractState from '@/hooks/useContractState';
import { useTx } from '@/hooks/useink/useTx';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { PluginInfo, PostPerm, Props } from '@/types';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { PLUGIN_POSTS } from '@/utils/plugins';
import { shouldDisableStrict } from 'useink/utils';

interface PostConfigProps extends Props {
  pluginInfo: PluginInfo;
}

export default function PostConfig({ pluginInfo }: PostConfigProps) {
  const { isOwner } = useSpaceContext();
  const { contract: postContract } = usePluginContract(pluginInfo);
  const { state: currentPostPerm } = useContractState<PostPerm>(postContract, 'postPerm');
  const [postPerm, setPostPerm] = useState<PostPerm>();
  const freeBalance = useCurrentFreeBalance();
  const updatePermTx = useTx(postContract, 'updatePerm');

  useEffect(() => {
    setPostPerm(currentPostPerm);
  }, [currentPostPerm]);

  if (pluginInfo.id !== PLUGIN_POSTS) {
    return null;
  }

  const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPostPerm(e.target.value as PostPerm);
  };

  const doUpdatePermission = () => {
    if (freeBalance === 0) {
      toast.error(messages.insufficientBalance);
      return;
    }

    updatePermTx.signAndSend([postPerm], {}, (result) => {
      if (!result) {
        updatePermTx.resetState();
        return;
      }

      notifyTxStatus(result);
      if (result.isInBlock) {
        if (result.dispatchError) {
          toast.error(messages.txError);
        } else {
          toast.success('Post permisison updated');
        }

        updatePermTx.resetState();
      }
    });
  };

  return (
    <Box mb={4} ml={8} maxWidth={400}>
      <FormControl isRequired>
        <FormLabel fontSize='sm'>Post Permission</FormLabel>
        <Select size='sm' isReadOnly={!isOwner} isDisabled={!isOwner} value={postPerm} onChange={onChange}>
          <option value={PostPerm.SpaceOwner}>Space Owner</option>
          <option value={PostPerm.ActiveMember}>Active Members</option>
        </Select>
        <FormHelperText>Choose who can make posts.</FormHelperText>
      </FormControl>
      {isOwner && (
        <Button
          size='xs'
          variant='outline'
          colorScheme='primary'
          mt={4}
          onClick={doUpdatePermission}
          isLoading={shouldDisableStrict(updatePermTx)}>
          Update Permission
        </Button>
      )}
    </Box>
  );
}

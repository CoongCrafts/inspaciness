import { MenuItem } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import { useTx } from '@/hooks/useink/useTx';
import { PostContent, PostRecord, Props } from '@/types';
import { unpinData } from '@/utils/ipfs';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { DeleteIcon } from '@chakra-ui/icons';
import { shouldDisableStrict } from 'useink/utils';
import { usePostsContext } from '../PostsProvider';

interface CancelPendingPostButtonProps extends Props {
  postRecord: PostRecord;
}

export default function CancelPendingPostButton({ postRecord: { postId, post } }: CancelPendingPostButtonProps) {
  const { contract } = usePostsContext();
  const cancelPendingRequestTx = useTx(contract, 'cancelPendingPost');
  const freeBalance = useCurrentFreeBalance();
  const postContentType = PostContent.IpfsCid in post.content ? PostContent.IpfsCid : PostContent.Raw;

  const doCancel = () => {
    if (freeBalance === 0) {
      toast.error(messages.insufficientBalance);
      return;
    }

    cancelPendingRequestTx.signAndSend([postId], {}, async (result) => {
      if (!result) {
        cancelPendingRequestTx.resetState();
        return;
      }

      notifyTxStatus(result);

      if (result?.isInBlock) {
        if (result.dispatchError) {
          toast.error(messages.txError);
        } else {
          toast.success('Pending request canceled');

          try {
            if (postContentType === PostContent.IpfsCid) {
              await unpinData((post.content as { [PostContent.IpfsCid]: string }).IpfsCid);
            }
          } catch (e) {
            toast.error((e as Error).message);
          }
        }
      }
    });
  };

  const processing = shouldDisableStrict(cancelPendingRequestTx);

  return (
    <MenuItem onClick={doCancel} icon={<DeleteIcon />} isDisabled={processing}>
      Cancel
    </MenuItem>
  );
}

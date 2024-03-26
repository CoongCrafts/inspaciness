import { MenuItem } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import { useTx } from '@/hooks/useink/useTx';
import { usePostsContext } from '@/pages/plugins/Posts/PostsProvider';
import { Props } from '@/types';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { DeleteIcon } from '@chakra-ui/icons';

interface CancelPendingPostButtonProps extends Props {
  postId: number;
}

export default function CancelPendingPostButton({ postId }: CancelPendingPostButtonProps) {
  const { contract } = usePostsContext();
  const cancelPendingRequestTx = useTx(contract, 'cancelPendingPost');
  const freeBalance = useCurrentFreeBalance();

  const doCancel = () => {
    if (freeBalance === 0) {
      toast.error(messages.insufficientBalance);
      return;
    }

    cancelPendingRequestTx.signAndSend([postId], {}, (result) => {
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
        }
      }
    });
  };

  return (
    <MenuItem onClick={doCancel} icon={<DeleteIcon />}>
      Cancel
    </MenuItem>
  );
}

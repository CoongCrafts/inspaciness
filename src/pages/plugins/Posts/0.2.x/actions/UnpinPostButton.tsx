import { MenuItem } from '@chakra-ui/react';
import { RiUnpinLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import { useTx } from '@/hooks/useink/useTx';
import { messages } from '@/utils/messages';
import { usePostsContext } from '../PostsProvider';

interface UnpinPostButtonProps {
  postId: number;
}

export default function UnpinPostButton({ postId }: UnpinPostButtonProps) {
  const { contract } = usePostsContext();
  const unpinPostTx = useTx(contract, 'unpinPost');
  const freeBalance = useCurrentFreeBalance();

  const doUnpinPost = () => {
    if (!freeBalance) {
      toast.error('Not enough balance');
      return;
    }

    unpinPostTx.signAndSend([postId], undefined, (result) => {
      if (!result) {
        unpinPostTx.resetState();
        return;
      }

      if (result.isInBlock) {
        if (result.dispatchError) {
          toast.error(messages.txError);
        } else {
          console.log('Post unpinned');
        }

        unpinPostTx.resetState();
      }
    });
  };

  return (
    <MenuItem icon={<RiUnpinLine />} onClick={doUnpinPost}>
      Unpin post
    </MenuItem>
  );
}

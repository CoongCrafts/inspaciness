import { MenuItem } from '@chakra-ui/react';
import { RiPushpinLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import { useTx } from '@/hooks/useink/useTx';
import { messages } from '@/utils/messages';
import { usePostsContext } from '../PostsProvider';

interface PinPostButtonProps {
  postId: number;
}

export default function PinPostButton({ postId }: PinPostButtonProps) {
  const { contract } = usePostsContext();
  const pinPostTx = useTx(contract, 'pinPost');
  const freeBalance = useCurrentFreeBalance();

  const doPinPost = () => {
    if (!freeBalance) {
      toast.error('Not enough balance');
      return;
    }

    pinPostTx.signAndSend([postId], undefined, (result) => {
      if (!result) {
        pinPostTx.resetState();
        return;
      }

      if (result.isInBlock) {
        if (result.dispatchError) {
          toast.error(messages.txError);
        } else {
          toast.success('Post pinned');
        }

        pinPostTx.resetState();
      }
    });
  };

  return (
    <MenuItem icon={<RiPushpinLine />} onClick={doPinPost}>
      Pin Post
    </MenuItem>
  );
}

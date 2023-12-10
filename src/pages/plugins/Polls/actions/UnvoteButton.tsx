import { Button } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { useTx } from '@/hooks/useink/useTx';
import { usePollsContext } from '@/pages/plugins/Polls/PollsProvider';
import { Props } from '@/types';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';

interface UnvoteButtonProps extends Props {
  pollId: number;
}

export default function UnvoteButton({ pollId }: UnvoteButtonProps) {
  const { contract } = usePollsContext();
  const unvoteTx = useTx(contract, 'unvote');

  const doUnvote = () => {
    unvoteTx.signAndSend([pollId], undefined, (result) => {
      if (!result) {
        unvoteTx.resetState();
        return;
      }

      notifyTxStatus(result);

      if (result.isInBlock) {
        if (result.dispatchError) {
          toast.error(messages.txError);
        } else {
          toast.success('Vote removed');
        }
      }

      unvoteTx.resetState();
    });
  };

  return (
    <>
      <Button onClick={doUnvote} size='sm' variant='outline' minWidth={20}>
        Remove Vote
      </Button>
    </>
  );
}
